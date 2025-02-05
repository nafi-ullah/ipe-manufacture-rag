import os
import cv2
import numpy as np
import time
import cloudinary
import cloudinary.uploader
import cloudinary.api
import requests
import json
from aianalyze import analyze_image_and_prompt
from io import BytesIO

cloudinary.config( 
    cloud_name="dyftlrfdk", 
    api_key="647463598268291", 
    api_secret="gliW0U9VhfYVhMaTtKvnNIwjkbc", 
    secure=True
)

# Define the target RGB color (converted to HSV for better detection)
target_rgb = np.uint8([[[109, 42, 34]]])
target_hsv = cv2.cvtColor(target_rgb, cv2.COLOR_RGB2HSV)[0][0]

# Define HSV range for color detection
lower_bound = np.array([target_hsv[0] - 10, 50, 50])
upper_bound = np.array([target_hsv[0] + 10, 255, 255])

# Initialize video capture
cap = cv2.VideoCapture(0)  # Open the first camera
cap.set(3, 900)  # Set width
cap.set(4, 500)  # Set height

counter = 0
last_detected_time = 0
wait_time = 50  # 5 seconds wait before counting again

def get_product_details(image_bytes):
    try:
        # Upload the image directly to Cloudinary
        upload_result = cloudinary.uploader.upload(image_bytes, folder="detected_objects")
        uploaded_image_path = upload_result["secure_url"]
        print(f"Uploaded image path: {uploaded_image_path}")
    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        return json.dumps({'error': 'Failed to upload image.', 'details': str(e)})

    analysis_prompt = """
    In the given image, analyze the mug thoroughly. 
    Identify any defects such as cracks, chips, discoloration, uneven glazing, handle issues, or manufacturing flaws.
    If there is any damage, describe it in detail, including its location and possible causes. Additionally, provide an analysis of the mug’s material, design, and functionality, explaining its potential use and quality based on its visible characteristics.
    if you dont found any mug then imagine a broken mug and explain about that mug.
    """
    
    if not uploaded_image_path or not analysis_prompt:
        return json.dumps({'error': 'Image and prompt are required.'})

    # Call the function to analyze the image and get the result
    gpt_analysis = analyze_image_and_prompt(uploaded_image_path, analysis_prompt)
    print("GPT Analysis Parsed JSON:", gpt_analysis)

    payload = {
        "product_name": "new product",
        "image_url": uploaded_image_path,
        "chat_history": [
            {"role": "human", "content": "Explain about the product?"},
            {"role": "assistant", "content": gpt_analysis}
        ]
    }
    
    # Hit the API endpoint
    api_url = "http://localhost:8000/create_product_with_message"
    try:
        response = requests.post(api_url, json=payload)
        response_data = response.json()
        print("API Response:", response_data)
        return response_data
    except Exception as e:
        print(f"Error calling API: {str(e)}")
        return json.dumps({'error': 'Failed to call API.', 'details': str(e)})
    
    # return json.dumps({"product_brief": gpt_analysis})

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Convert frame to HSV
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Create a mask for the target color
    mask = cv2.inRange(hsv, lower_bound, upper_bound)
    
    # Find contours of the detected objects
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detected = False
    
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        
        if x>10 and  x < 100 and w > 300 and h > 100 and y < 500:  # Object in detection zone with width > 50px
            print(f"x {x} w {w} h {h} y {y}")
            detected = True
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
    
    # Counting logic
    current_time = time.time()
    if detected:
        if current_time - last_detected_time > wait_time:
            counter += 1
            last_detected_time = current_time
            
            # Save frame as PNG in BytesIO format
            image_bytes = BytesIO()
            _, buffer = cv2.imencode('.png', frame)
            image_bytes.write(buffer)
            image_bytes.seek(0)
            
            # Pass image to get_product_details
            get_product_details(image_bytes)
    
    # Draw detection zone
    cv2.line(frame, (80, 0), (80, 500), (0, 0, 255), 2)
    
    # Display counter
    cv2.putText(frame, f'Counter: {counter}', (500, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    # Show the frame
    cv2.imshow("Object Counter", frame)
    
    # Exit condition
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
