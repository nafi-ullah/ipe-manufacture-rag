
import os
from dotenv import load_dotenv

load_dotenv()
import openai
from flask import Flask, request, jsonify
import requests

# Retrieve API key from environment variable
openai.api_key = os.getenv('OPENAI_API_KEY')

def analyze_image_and_prompt(image_url, prompt):
    # Prepare the request to GPT-4o-mini
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url,
                        },
                    },
                ],
            }
        ],
        max_tokens=300,
    )
    
    if response.choices and response.choices[0].message:
        print(response.choices[0].message.content)
        return response.choices[0].message.content
    else:
        
        return {'error': 'Failed to analyze the image and prompt.'}