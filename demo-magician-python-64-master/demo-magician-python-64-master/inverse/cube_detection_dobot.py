# © 2025 Dilip Kumar S and Gokul S. All Rights Reserved.
# Authors: Dilip Kumar S , Gokul S
# Date: 2025-01-01
# This script is part of a proprietary project and may not be copied,
# modified, distributed, or used without explicit written permission 
# from the authors.
#
# This work was developed as part of a project at the Department of Robotics 
# and Automation, Rajalakshmi Engineering College, under the mentorship of 
# Mr. Ramkumar and guidance of our HoD, Dr. Giri.
#
# WARNING: Any attempt to remove or alter this notice is strictly prohibited.
import cv2
import numpy as np
import json
import time  # Import time module for adding delay

# Load Homography Matrix (assumed you calibrated earlier and saved as 'cam_to_dobot_matrix.npy')
homography_matrix = np.load('cam_to_dobot_matrix.npy')

# Load taught colors from JSON file
with open('color d&t/taught_colors.json', 'r') as f:
    taught_colors = json.load(f)

# Open Camera
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Error: Could not open camera.")
    exit()

# Storage for last detected position
detected_data = None

print("📷 Detecting objects... Press 'q' to quit.")

# Time interval between detections in seconds
detection_delay = 2  # Adjust this to your preferred delay time (in seconds)

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Failed to grab frame")
        break

    frame = cv2.resize(frame, (640, 480))  # Resize frame to ensure smooth display
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    mask = np.zeros(frame.shape[:2], dtype=np.uint8)

    for color_name, ranges in taught_colors.items():
        lower = np.array(ranges["lower"])
        upper = np.array(ranges["upper"])

        color_mask = cv2.inRange(hsv, lower, upper)
        color_mask = cv2.erode(color_mask, None, iterations=2)
        color_mask = cv2.dilate(color_mask, None, iterations=2)
        mask = cv2.bitwise_or(mask, color_mask)

        contours, _ = cv2.findContours(color_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > 500:
                M = cv2.moments(cnt)
                if M["m00"] != 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])

                    cv2.circle(frame, (cx, cy), 5, (0, 255, 0), -1)
                    cv2.putText(frame, f"{color_name}: ({cx}, {cy})", (cx + 10, cy), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

                    # Convert to robot coordinates automatically
                    pixel_point = np.array([[[cx, cy]]], dtype='float32')
                    world_point = cv2.perspectiveTransform(pixel_point, homography_matrix)
                    x_dobot, y_dobot = world_point[0][0]

                    z_dobot = -26.0
                    r_dobot = 0.0

                    cube_data = [round(float(x_dobot), 2), round(float(y_dobot), 2), z_dobot, r_dobot]
                    detected_data = cube_data
                    print(f"✅ Auto-saved {color_name}: {cube_data}")

                    # Automatically end the loop once an object is detected and saved
                    time.sleep(detection_delay)  # Add delay before allowing next detection
                    break  # This breaks out of the for loop

    # If object is detected, exit the main loop
    if detected_data:
        break

    # Display the camera feed with the mask and object detection
    cv2.imshow("Camera View", frame)
    cv2.imshow("Mask", mask)

    # Wait for 'q' key to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Save last detected position
if detected_data:
    with open('inverse/detected_positions.json', 'w') as f:
        json.dump(detected_data, f, indent=4)
    print("📁 Detected position saved as 'detected_positions.json'")
else:
    print("⚠ No object detected, nothing saved.")

cap.release()
cv2.destroyAllWindows()