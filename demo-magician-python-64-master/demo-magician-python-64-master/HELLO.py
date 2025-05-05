# © 2025 Dilip Kumar S and Gokul S. All Rights Reserved.
# Authors: Dilip Kumar S, Gokul S
# Date: 2025-01-01
#
# This script is part of a proprietary project and may not be copied,
# modified, distributed, or used without explicit written permission 
# from the authors.
#
# This work was developed as part of a project at the Department of Robotics 
# and Automation, Rajalakshmi Engineering College, under the mentorship of 
# Mr. Ramkumar and guidance of our HoD, Dr. Giri.
#
# The computer vision logic in this script was fully developed by the authors
# and does not rely on any third-party SDKs or frameworks.
# 
# For robot motion control, this script uses only the official Dobot SDK 
# (DobotDllType) to ensure proper interfacing with the Dobot robotic arm,
# in accordance with the manufacturer's licensing and usage guidelines.
#
# WARNING: Any attempt to remove or alter this notice is strictly prohibited.
import DobotDllType as dType
from copy import deepcopy
import json


# Load cube states
with open("Inverse/detected_positions.json", "r") as f:
    coordinates = json.load(f)
    X = coordinates[0]
    Y = coordinates[1]
    Z = coordinates[2]

# Connect to Dobot
CON_STR = {
    dType.DobotConnect.DobotConnect_NoError: "DobotConnect_NoError",
    dType.DobotConnect.DobotConnect_NotFound: "DobotConnect_NotFound",
    dType.DobotConnect.DobotConnect_Occupied: "DobotConnect_Occupied"
}

api = dType.load()
state = dType.ConnectDobot(api, "COM9", 115200)[0]
print("Connect status:", CON_STR[state])

if state == dType.DobotConnect.DobotConnect_NoError:
    dType.SetQueuedCmdClear(api)

    dType.SetHOMEParams(api, 159.9386, -3.1038, -23.3520, -2.0209, isQueued=1)
    dType.SetPTPJointParams(api, 100, 100, 100, 100, 100, 100, 100, 100, isQueued=1)
    dType.SetPTPCommonParams(api, 100, 100, isQueued=1)
    dType.SetQueuedCmdStartExec(api)
    dType.dSleep(5000)

    # Variables
    gap = 60
    homex = 210.8128
    homey = -65.7639
    homez = 17.9405
    z_increment = 0
    y_increment = 0
    operation = 1
    homey1 = homey
    homez1 = homez
    location = 0
    approach = 1

    # Define State-based solver



    # Robot movement commands
    def pick():
        current_pose = dType.GetPose(api)
        dType.SetPTPCmdEx(api, 2, X, Y, -42.7519, current_pose[3], 1)
        dType.SetEndEffectorSuctionCupEx(api, 1, 1)
        dType.SetPTPCmdEx(api, 2, X, Y, -5.0959, current_pose[3], 1)
        dType.SetEndEffectorSuctionCupEx(api, 1, 1)

    def drop():
        current_pose = dType.GetPose(api)
        dType.SetPTPCmdEx(api, 2, 235.6014, -194.2816, -5.0959, current_pose[3], 1)
        dType.SetEndEffectorSuctionCupEx(api, 1, 1)
        dType.SetPTPCmdEx(api, 2, 235.6014, -194.2816, -38.7919, current_pose[3], 1)
        dType.SetEndEffectorSuctionCupEx(api, 0, 1)
        dType.SetPTPCmdEx(api, 2, 235.6014, -194.2816, -5.0959, current_pose[3], 1)

    
    print("Running Inverse_kinematics and executing...")
    print(coordinates)
    current_pose = dType.GetPose(api)
    dType.SetPTPCmdEx(api, 2, X, Y, Z, current_pose[3], 1)
    pick()
    drop()
    dType.SetPTPCmdEx(api, 2, 160.0321, -3.1056, -23.3732, current_pose[3], 1)

    dType.DisconnectDobot(api)