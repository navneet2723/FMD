import torch
import torch.nn as nn
from torchvision import models

class DeepfakeDetector(nn.Module):
    def __init__(self, num_classes=2):
        super(DeepfakeDetector, self).__init__()
        # Use a pre-trained ResNet as feature extractor
        base_model = models.resnet50(pretrained=True)
        
        # Remove the last two layers (avgpool and fc)
        self.features = nn.Sequential(*list(base_model.children())[:-2])
        
        # Custom classifier
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(2048, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        # Extract features
        features = self.features(x)
        # Classify
        output = self.classifier(features)
        return output