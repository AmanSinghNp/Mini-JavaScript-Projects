# Convex Hull Visualiser

Interactive visualization of the **Graham Scan** algorithm for finding the convex hull of a set of points.

## Features

- **Click to Add**: Click anywhere on the canvas to add custom points
- **Generate Random**: Generate random points with configurable count
- **Step Animation**: Watch the algorithm process points one by one
- **Visual Feedback**: Color-coded points (pivot, scanning, hull)

## Algorithm

Graham Scan runs in O(n log n) time:
1. Find the lowest point (pivot)
2. Sort remaining points by polar angle from pivot
3. Process points, removing those that create clockwise turns

## Controls

- **Generate Points**: Create random point set
- **Clear All**: Remove all points
- **Point Count**: Adjust number of random points
- **Speed**: Control animation delay
- **Find Convex Hull**: Run the algorithm
