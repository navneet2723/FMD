import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Shield, Brain } from 'lucide-react';

const WhyDetectSection: React.FC = () => {
  const reasons = [
    {
      icon: <Eye className="h-12 w-12 text-blue-500" />,
      title: "Unmask Misinformation",
      description: "Identify fake news and manipulated media to ensure the truth prevails."
    },
    {
      icon: <Shield className="h-12 w-12 text-red-500" />,
      title: "Protect Your Integrity",
      description: "Stay informed and guard against the dangers of disinformation campaigns."
    },
    {
      icon: <Brain className="h-12 w-12 text-green-500" />,
      title: "Empower Critical Thinking",
      description: "Sharpen your ability to discern facts from fiction in the digital age."
    }
  ];

  return (
    <section className="py-16 bg-gray-50 flex justify-center items-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Detect Fake Media?</h2>
        <div className="grid md:grid-cols-3 gap-8 justify-center">
          {reasons.map((reason, index) => (
            <Card key={index} className="hover:shadow-lg transition-all">
              <CardHeader className="flex items-center justify-center">
                {reason.icon}
                <CardTitle className="ml-4 text-center">{reason.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">{reason.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyDetectSection;
