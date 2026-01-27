# Binary Search Visualiser

Interactive visualization of the **Binary Search** algorithm on a sorted array.

## Features

- **Step-by-Step Animation**: Watch left, mid, right pointers move
- **Visual Elimination**: Eliminated portions fade out
- **Auto/Random Target**: Generate targets from array or random values
- **Speed Control**: Adjust animation speed
- **Comparison Counter**: Track algorithm efficiency

## Algorithm

Binary Search runs in O(log n) time:
1. Start with left=0, right=n-1
2. Calculate mid = (left + right) / 2
3. If arr[mid] == target, found!
4. If arr[mid] < target, search right half
5. If arr[mid] > target, search left half
6. Repeat until found or left > right

## Controls

- **New Array**: Generate new sorted random array
- **Target Input**: Enter value to search
- **🎲 Button**: Pick random target (80% from array, 20% not in array)
- **Array Size**: Adjust number of elements
- **Speed**: Control animation delay
- **Start Search**: Run the algorithm

## Color Legend

| Color | Meaning |
|-------|---------|
| Purple | Left pointer |
| Yellow | Mid pointer (being compared) |
| Orange | Right pointer |
| Green | Found target |
| Gray | Eliminated from search |
