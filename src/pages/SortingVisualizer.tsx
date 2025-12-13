import { useState, useCallback, useRef, useEffect } from 'react';

type SortingAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap';

interface ArrayBar {
  value: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

interface SortStats {
  comparisons: number;
  swaps: number;
  arrayAccesses: number;
}

// Sound generator for sorting
const playSound = (frequency: number, duration: number = 50) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (e) {
    // Audio not supported
  }
};

export default function SortingVisualizer() {
  const [array, setArray] = useState<ArrayBar[]>([]);
  const [arraySize, setArraySize] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('bubble');
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<SortStats>({ comparisons: 0, swaps: 0, arrayAccesses: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const sortingRef = useRef(false);
  const pausedRef = useRef(false);

  // Generate random array
  const generateArray = useCallback(() => {
    const newArray: ArrayBar[] = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 400) + 10,
        state: 'default'
      });
    }
    setArray(newArray);
    setStats({ comparisons: 0, swaps: 0, arrayAccesses: 0 });
  }, [arraySize]);

  useEffect(() => {
    generateArray();
  }, [generateArray]);

  // Sleep function with pause support
  const sleep = (ms: number) => {
    return new Promise<void>(resolve => {
      const checkPause = () => {
        if (!sortingRef.current) {
          resolve();
          return;
        }
        if (pausedRef.current) {
          setTimeout(checkPause, 50);
        } else {
          setTimeout(resolve, ms);
        }
      };
      checkPause();
    });
  };

  // Update array state
  const updateArray = (newArray: ArrayBar[]) => {
    setArray([...newArray]);
  };

  // Play sound based on value
  const playSortSound = (value: number) => {
    if (soundEnabled) {
      const frequency = 200 + (value / 410) * 600; // Map value to frequency range
      playSound(frequency, 30);
    }
  };

  // Bubble Sort
  const bubbleSort = async (arr: ArrayBar[]) => {
    let comparisons = 0;
    let swaps = 0;
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!sortingRef.current) return;
        
        arr[j].state = 'comparing';
        arr[j + 1].state = 'comparing';
        updateArray(arr);
        comparisons++;
        setStats(s => ({ ...s, comparisons }));
        
        await sleep(101 - speed);
        
        if (arr[j].value > arr[j + 1].value) {
          arr[j].state = 'swapping';
          arr[j + 1].state = 'swapping';
          updateArray(arr);
          playSortSound(arr[j].value);
          
          await sleep(101 - speed);
          
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps++;
          setStats(s => ({ ...s, swaps }));
        }
        
        arr[j].state = 'default';
        arr[j + 1].state = 'default';
      }
      arr[n - 1 - i].state = 'sorted';
      updateArray(arr);
    }
    arr[0].state = 'sorted';
    updateArray(arr);
  };

  // Selection Sort
  const selectionSort = async (arr: ArrayBar[]) => {
    let comparisons = 0;
    let swaps = 0;
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      arr[i].state = 'pivot';
      updateArray(arr);
      
      for (let j = i + 1; j < n; j++) {
        if (!sortingRef.current) return;
        
        arr[j].state = 'comparing';
        updateArray(arr);
        comparisons++;
        setStats(s => ({ ...s, comparisons }));
        
        await sleep(101 - speed);
        
        if (arr[j].value < arr[minIdx].value) {
          if (minIdx !== i) arr[minIdx].state = 'default';
          minIdx = j;
          arr[minIdx].state = 'swapping';
        } else {
          arr[j].state = 'default';
        }
        updateArray(arr);
      }
      
      if (minIdx !== i) {
        playSortSound(arr[minIdx].value);
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        swaps++;
        setStats(s => ({ ...s, swaps }));
      }
      
      arr[i].state = 'sorted';
      if (minIdx !== i) arr[minIdx].state = 'default';
      updateArray(arr);
    }
    arr[n - 1].state = 'sorted';
    updateArray(arr);
  };

  // Insertion Sort
  const insertionSort = async (arr: ArrayBar[]) => {
    let comparisons = 0;
    let swaps = 0;
    const n = arr.length;
    
    arr[0].state = 'sorted';
    updateArray(arr);
    
    for (let i = 1; i < n; i++) {
      if (!sortingRef.current) return;
      
      const key = arr[i];
      key.state = 'pivot';
      updateArray(arr);
      
      let j = i - 1;
      
      while (j >= 0) {
        comparisons++;
        setStats(s => ({ ...s, comparisons }));
        
        arr[j].state = 'comparing';
        updateArray(arr);
        await sleep(101 - speed);
        
        if (arr[j].value > key.value) {
          arr[j].state = 'swapping';
          updateArray(arr);
          playSortSound(arr[j].value);
          
          await sleep(101 - speed);
          
          arr[j + 1] = arr[j];
          swaps++;
          setStats(s => ({ ...s, swaps }));
          arr[j].state = 'sorted';
          j--;
        } else {
          arr[j].state = 'sorted';
          break;
        }
        updateArray(arr);
      }
      
      arr[j + 1] = key;
      arr[j + 1].state = 'sorted';
      updateArray(arr);
    }
  };

  // Merge Sort
  const mergeSort = async (arr: ArrayBar[], left: number = 0, right: number = arr.length - 1) => {
    if (left >= right || !sortingRef.current) return;
    
    const mid = Math.floor((left + right) / 2);
    await mergeSort(arr, left, mid);
    await mergeSort(arr, mid + 1, right);
    await merge(arr, left, mid, right);
  };

  const merge = async (arr: ArrayBar[], left: number, mid: number, right: number) => {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;
    
    while (i < leftArr.length && j < rightArr.length) {
      if (!sortingRef.current) return;
      
      arr[k].state = 'comparing';
      updateArray(arr);
      setStats(s => ({ ...s, comparisons: s.comparisons + 1 }));
      
      await sleep(101 - speed);
      
      if (leftArr[i].value <= rightArr[j].value) {
        arr[k] = { ...leftArr[i], state: 'swapping' };
        playSortSound(leftArr[i].value);
        i++;
      } else {
        arr[k] = { ...rightArr[j], state: 'swapping' };
        playSortSound(rightArr[j].value);
        j++;
      }
      
      setStats(s => ({ ...s, swaps: s.swaps + 1 }));
      updateArray(arr);
      await sleep(101 - speed);
      
      arr[k].state = k <= mid ? 'default' : 'default';
      k++;
    }
    
    while (i < leftArr.length) {
      if (!sortingRef.current) return;
      arr[k] = { ...leftArr[i], state: 'default' };
      i++;
      k++;
      updateArray(arr);
      await sleep(101 - speed);
    }
    
    while (j < rightArr.length) {
      if (!sortingRef.current) return;
      arr[k] = { ...rightArr[j], state: 'default' };
      j++;
      k++;
      updateArray(arr);
      await sleep(101 - speed);
    }
    
    // Mark as sorted if we're at the final merge
    if (left === 0 && right === arr.length - 1) {
      for (let x = 0; x < arr.length; x++) {
        arr[x].state = 'sorted';
      }
      updateArray(arr);
    }
  };

  // Quick Sort
  const quickSort = async (arr: ArrayBar[], low: number = 0, high: number = arr.length - 1) => {
    if (low < high && sortingRef.current) {
      const pivotIdx = await partition(arr, low, high);
      await quickSort(arr, low, pivotIdx - 1);
      await quickSort(arr, pivotIdx + 1, high);
    }
    
    // Mark as sorted when done
    if (low === 0 && high === arr.length - 1) {
      for (let i = 0; i < arr.length; i++) {
        arr[i].state = 'sorted';
      }
      updateArray(arr);
    }
  };

  const partition = async (arr: ArrayBar[], low: number, high: number): Promise<number> => {
    const pivot = arr[high];
    pivot.state = 'pivot';
    updateArray(arr);
    
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      if (!sortingRef.current) return low;
      
      arr[j].state = 'comparing';
      updateArray(arr);
      setStats(s => ({ ...s, comparisons: s.comparisons + 1 }));
      
      await sleep(101 - speed);
      
      if (arr[j].value < pivot.value) {
        i++;
        arr[i].state = 'swapping';
        arr[j].state = 'swapping';
        updateArray(arr);
        playSortSound(arr[j].value);
        
        await sleep(101 - speed);
        
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setStats(s => ({ ...s, swaps: s.swaps + 1 }));
      }
      
      arr[j].state = 'default';
      if (i >= low) arr[i].state = 'default';
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    arr[i + 1].state = 'sorted';
    pivot.state = 'default';
    updateArray(arr);
    
    return i + 1;
  };

  // Heap Sort
  const heapSort = async (arr: ArrayBar[]) => {
    const n = arr.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(arr, n, i);
    }
    
    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
      if (!sortingRef.current) return;
      
      arr[0].state = 'swapping';
      arr[i].state = 'swapping';
      updateArray(arr);
      playSortSound(arr[0].value);
      
      await sleep(101 - speed);
      
      [arr[0], arr[i]] = [arr[i], arr[0]];
      setStats(s => ({ ...s, swaps: s.swaps + 1 }));
      
      arr[i].state = 'sorted';
      arr[0].state = 'default';
      updateArray(arr);
      
      await heapify(arr, i, 0);
    }
    
    arr[0].state = 'sorted';
    updateArray(arr);
  };

  const heapify = async (arr: ArrayBar[], n: number, i: number) => {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (!sortingRef.current) return;
    
    if (left < n) {
      arr[left].state = 'comparing';
      updateArray(arr);
      setStats(s => ({ ...s, comparisons: s.comparisons + 1 }));
      await sleep(101 - speed);
      
      if (arr[left].value > arr[largest].value) {
        largest = left;
      }
      arr[left].state = 'default';
    }
    
    if (right < n) {
      arr[right].state = 'comparing';
      updateArray(arr);
      setStats(s => ({ ...s, comparisons: s.comparisons + 1 }));
      await sleep(101 - speed);
      
      if (arr[right].value > arr[largest].value) {
        largest = right;
      }
      arr[right].state = 'default';
    }
    
    if (largest !== i) {
      arr[i].state = 'swapping';
      arr[largest].state = 'swapping';
      updateArray(arr);
      playSortSound(arr[largest].value);
      
      await sleep(101 - speed);
      
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      setStats(s => ({ ...s, swaps: s.swaps + 1 }));
      
      arr[i].state = 'default';
      arr[largest].state = 'default';
      updateArray(arr);
      
      await heapify(arr, n, largest);
    }
  };

  // Start sorting
  const startSort = async () => {
    if (isSorting) return;
    
    sortingRef.current = true;
    pausedRef.current = false;
    setIsSorting(true);
    setIsPaused(false);
    setStats({ comparisons: 0, swaps: 0, arrayAccesses: 0 });
    
    // Reset array states
    const arr = array.map(bar => ({ ...bar, state: 'default' as const }));
    setArray(arr);
    
    switch (algorithm) {
      case 'bubble':
        await bubbleSort(arr);
        break;
      case 'selection':
        await selectionSort(arr);
        break;
      case 'insertion':
        await insertionSort(arr);
        break;
      case 'merge':
        await mergeSort(arr);
        break;
      case 'quick':
        await quickSort(arr);
        break;
      case 'heap':
        await heapSort(arr);
        break;
    }
    
    sortingRef.current = false;
    setIsSorting(false);
  };

  // Stop sorting
  const stopSort = () => {
    sortingRef.current = false;
    setIsSorting(false);
    setIsPaused(false);
  };

  // Toggle pause
  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(!isPaused);
  };

  // Get bar color based on state
  const getBarColor = (state: ArrayBar['state']) => {
    switch (state) {
      case 'comparing': return '#fbbf24'; // Yellow
      case 'swapping': return '#ef4444'; // Red
      case 'sorted': return '#10b981'; // Green
      case 'pivot': return '#8b5cf6'; // Purple
      default: return '#6366f1'; // Primary
    }
  };

  const algorithmInfo: Record<SortingAlgorithm, { name: string; time: string; space: string; description: string }> = {
    bubble: {
      name: 'Bubble Sort',
      time: 'O(n²)',
      space: 'O(1)',
      description: 'Repeatedly swaps adjacent elements if they are in wrong order.'
    },
    selection: {
      name: 'Selection Sort',
      time: 'O(n²)',
      space: 'O(1)',
      description: 'Selects the minimum element and places it at the beginning.'
    },
    insertion: {
      name: 'Insertion Sort',
      time: 'O(n²)',
      space: 'O(1)',
      description: 'Builds sorted array one element at a time by inserting in correct position.'
    },
    merge: {
      name: 'Merge Sort',
      time: 'O(n log n)',
      space: 'O(n)',
      description: 'Divides array in half, sorts each half, then merges them.'
    },
    quick: {
      name: 'Quick Sort',
      time: 'O(n log n)*',
      space: 'O(log n)',
      description: 'Picks a pivot, partitions around it, then recursively sorts partitions.'
    },
    heap: {
      name: 'Heap Sort',
      time: 'O(n log n)',
      space: 'O(1)',
      description: 'Builds a max heap, then repeatedly extracts the maximum.'
    }
  };

  return (
    <div className="sorting-visualizer">
      <div className="page-header">
        <h1>📊 Sorting Algorithms</h1>
        <p>Visualize and compare different sorting algorithms</p>
      </div>

      {/* Controls */}
      <div className="sorting-controls">
        <div className="control-group">
          <label>Algorithm</label>
          <select 
            value={algorithm} 
            onChange={(e) => setAlgorithm(e.target.value as SortingAlgorithm)}
            disabled={isSorting}
          >
            <option value="bubble">Bubble Sort</option>
            <option value="selection">Selection Sort</option>
            <option value="insertion">Insertion Sort</option>
            <option value="merge">Merge Sort</option>
            <option value="quick">Quick Sort</option>
            <option value="heap">Heap Sort</option>
          </select>
        </div>

        <div className="control-group">
          <label>Array Size: {arraySize}</label>
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            disabled={isSorting}
          />
        </div>

        <div className="control-group">
          <label>Speed: {speed}%</label>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Sound</label>
          <button 
            className={`sound-toggle ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <div className="control-buttons">
          <button 
            className="btn btn-secondary"
            onClick={generateArray}
            disabled={isSorting}
          >
            🎲 New Array
          </button>
          
          {!isSorting ? (
            <button className="btn btn-primary" onClick={startSort}>
              ▶️ Start
            </button>
          ) : (
            <>
              <button className="btn btn-warning" onClick={togglePause}>
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button className="btn btn-danger" onClick={stopSort}>
                ⏹️ Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Algorithm Info */}
      <div className="algorithm-info">
        <h3>{algorithmInfo[algorithm].name}</h3>
        <p>{algorithmInfo[algorithm].description}</p>
        <div className="complexity-badges">
          <span className="badge time">⏱️ Time: {algorithmInfo[algorithm].time}</span>
          <span className="badge space">💾 Space: {algorithmInfo[algorithm].space}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="sorting-stats">
        <div className="stat">
          <span className="stat-label">Comparisons</span>
          <span className="stat-value">{stats.comparisons}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Swaps</span>
          <span className="stat-value">{stats.swaps}</span>
        </div>
      </div>

      {/* Visualization */}
      <div className="bars-container">
        {array.map((bar, idx) => (
          <div
            key={idx}
            className="bar"
            style={{
              height: `${bar.value}px`,
              backgroundColor: getBarColor(bar.state),
              width: `${Math.max(2, 800 / arraySize - 1)}px`
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="sorting-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#6366f1' }}></span>
          <span>Unsorted</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#fbbf24' }}></span>
          <span>Comparing</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
          <span>Swapping</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></span>
          <span>Pivot</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
          <span>Sorted</span>
        </div>
      </div>
    </div>
  );
}
