import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import axios from "axios";

const MediaSection: React.FC = () => {
  const [activeUpload, setActiveUpload] = useState<"image" | "video" | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<string | undefined>(undefined);
  const [confidence, setConfidence] = useState<string | undefined>(undefined);
  const [framePredictions, setFramePredictions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cleanup function for preview URLs
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [preview, videoPreviewUrl]);

  const handleImageButtonClick = () => {
    setActiveUpload("image");
    resetStates();
  };

  const handleVideoButtonClick = () => {
    setActiveUpload("video");
    resetStates();
  };

  const resetStates = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setFileName(null);
    setPredictionResult(undefined);
    setConfidence(undefined);
    setError(null);
    setFramePredictions([]);
    setPreview(null);
    setVideoPreviewUrl(null);
    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current.load();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError(null);

      // Cleanup previous previews
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }

      if (activeUpload === "image") {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error("Error creating image preview:", error);
          setError("Failed to create image preview");
        }
      } else if (activeUpload === "video") {
        try {
          const url = URL.createObjectURL(file);
          setVideoPreviewUrl(url);
          if (videoRef.current) {
            videoRef.current.src = url;
            videoRef.current.load();
          }
        } catch (error) {
          console.error("Error creating video preview:", error);
          setError("Failed to create video preview");
        }
      }
    }
  };

  
  const handleImageUpload = async () => {
    if (!fileName) {
      setError("Please select an image file to upload.");
      return;
    }
  
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  
    if (fileInput?.files) {
      const file = fileInput.files[0];
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
      if (!allowedImageTypes.includes(file.type)) {
        setError("Invalid image file type. Please upload a JPEG, PNG, GIF, or WebP image.");
        return;
      }
  
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        setIsLoading(true);
        setError(null);
  
        const response = await axios.post("http://localhost:8000/image-ht/predict", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        console.log("API Response:", response.data);
  
        const prediction = response.data.prediction; 
        const confidence = response.data.confidence; 
        
        console.log("Prediction:", prediction);
        console.log("Confidence:", confidence);
        
        setPredictionResult(prediction.toUpperCase()); 
        setConfidence(confidence);
  
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Failed to upload and analyze the image. Please try again.");
        setPredictionResult(undefined);
        setConfidence(undefined);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("No image file selected.");
    }
  };

  const handleVideoUpload = async () => {
    if (!fileName) {
      setError("Please select a video file to upload.");
      return;
    }

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    if (fileInput?.files) {
      const file = fileInput.files[0];
      const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];

      if (!allowedVideoTypes.includes(file.type)) {
        setError("Invalid video file type. Please upload MP4, MPEG, QuickTime, or AVI video.");
        return;
      }

      const formData = new FormData();
      formData.append("video", file);

      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.post("http://localhost:8000/video/predict-video", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setPredictionResult(response.data.result);
        setConfidence(`${response.data.confidence.toFixed(2)}%`);
        setFramePredictions(response.data.frame_predictions);
      } catch (error) {
        console.error("Error uploading video:", error);
        setError("Failed to upload and analyze the video. Please try again.");
        setPredictionResult(undefined);
        setConfidence(undefined);
        setFramePredictions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("No video file selected.");
    }
  };

  const handleUpload = () => {
    if (activeUpload === "image") {
      handleImageUpload();
    } else if (activeUpload === "video") {
      handleVideoUpload();
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Analyze Media Content
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex items-center justify-center">
              <CardTitle className="text-center">Image Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Upload an image to analyze its authenticity. Detect signs of manipulation and uncover hidden details.
              </p>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={handleImageButtonClick}
                  className="bg-gray-900 text-white py-2 px-6 rounded-md hover:bg-gray-600"
                >
                  Upload Image
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex items-center justify-center">
              <CardTitle className="text-center">Video Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Dive deeper into video analysis with our advanced tools. Learn how to detect manipulated content effectively.
              </p>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={handleVideoButtonClick}
                  className="bg-gray-900 text-white py-2 px-6 rounded-md hover:bg-gray-600"
                >
                  Upload Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {activeUpload && (
          <div className="w-full flex justify-center py-12">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                Upload Your {activeUpload === "image" ? "Image" : "Video"} File
              </h3>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  {error}
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-2 text-gray-500" />
                  <p className="text-sm text-gray-500">
                    {fileName ? fileName : `Click to upload ${activeUpload === "image" ? "image" : "video"} file`}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept={activeUpload === "image" ? "image/*" : "video/*"}
                  onChange={handleFileChange}
                />
              </label>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-500 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Upload and Analyze"
                  )}
                </button>
                <button
                  onClick={() => setActiveUpload(null)}
                  disabled={isLoading}
                  className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>

              {/* Preview Section */}
              {(preview || videoPreviewUrl) && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3">Preview:</h4>
                  <div className="flex justify-center">
                    {activeUpload === "image" && preview && (
                      <img 
                        src={preview} 
                        alt="Selected image preview" 
                        className="max-w-full h-auto max-h-96 rounded-lg shadow-md"
                      />
                    )}
                    {activeUpload === "video" && videoPreviewUrl && (
                      <video 
                        ref={videoRef}
                        controls
                        controlsList="nodownload"
                        className="max-w-full h-auto max-h-96 rounded-lg shadow-md"
                      >
                        <source src={videoPreviewUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {predictionResult && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
            <p className="font-bold text-xl mb-2">Prediction Result:</p>
            <p className="text-lg">
              Prediction: <span className="font-semibold">{predictionResult}</span> | 
              Confidence: <span className="font-semibold">{confidence}</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaSection;