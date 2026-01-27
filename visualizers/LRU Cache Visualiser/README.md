# LRU Cache Visualiser

Interactive visualization of a **Least Recently Used (LRU) Cache** implemented with a doubly-linked list and hash map.

## Features

- **Put Operation**: Add or update key-value pairs
- **Get Operation**: Retrieve values (moves accessed item to front)
- **Visual Feedback**: Color-coded hits, misses, and evictions
- **Adjustable Capacity**: Change cache size with slider
- **Operation Log**: Terminal-style log of all operations

## Data Structure

The LRU Cache uses:
- **Doubly Linked List**: Maintains access order (MRU at head, LRU at tail)
- **Hash Map**: O(1) key lookup

## Operations

| Operation | Time Complexity | Description |
|-----------|-----------------|-------------|
| `get(key)` | O(1) | Returns value if exists, moves to front |
| `put(key, value)` | O(1) | Adds/updates entry, evicts LRU if full |

## Controls

- **Key/Value Inputs**: Enter data for operations
- **Put**: Add or update a cache entry
- **Get**: Look up a key (shows hit/miss)
- **Clear Cache**: Reset everything
- **Capacity Slider**: Adjust max entries (resets cache)
