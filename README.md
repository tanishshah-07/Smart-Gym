# Smart Gym Crowd Manager

A python-based system that optimizes gym equipment usage and minimizes waiting time using Greedy Algorithms (Activity Selection/Interval Scheduling).

## Problem Statement
Gyms face overcrowding and inefficient usage of machines during peak hours. This system resolves these issues by assigning specific time slots to users based on their preferred timings, required sequence of machines, and priority level. 

## Features
- **Greedy Interval Scheduling**: Sorts users by earliest finishing time and priority to maximize accommodated users.
- **Multi-Machine Sequences**: Automatically books contiguous blocks of time across multiple required machines.
- **Conflict Resolution**: Intelligently shifts user start times slightly to find an open slot rather than rejecting them immediately.
- **Neon UI Visualization**: Features a Streamlit-powered dark/neon purple UI with Gantt charts showing equipment usage.
- **Performance Metrics**: Compares the greedy approach against a naive First-Come-First-Serve baseline.

## Running Locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the application:
   ```bash
   streamlit run main.py
   ```
