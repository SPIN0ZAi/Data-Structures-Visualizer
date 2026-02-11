export interface ProcessState {
  id: number;
  name: string;
  wantsToEnter: boolean;
  turn: number;
  inCriticalSection: boolean;
  waiting: boolean;
  completed: boolean;
  position: 'idle' | 'requesting' | 'critical' | 'exiting';
}

export interface DekkerStep {
  stepNumber: number;
  process: number;
  action: string;
  description: string;
  codeLineP0?: number;
  codeLineP1?: number;
  flag0: boolean;
  flag1: boolean;
  turn: number;
  inCriticalSection: number | null;
}

export interface DekkerState {
  flag: [boolean, boolean];
  turn: number;
  processes: ProcessState[];
  steps: DekkerStep[];
  currentStep: number;
}

// Code lines for each process
export const dekkerCodeP0 = [
  "// Process 0",
  "flag[0] = true;",
  "while (flag[1]) {",
  "  if (turn == 1) {",
  "    flag[0] = false;",
  "    while (turn == 1) {}",
  "    flag[0] = true;",
  "  }",
  "}",
  "// Critical Section",
  "turn = 1;",
  "flag[0] = false;",
];

export const dekkerCodeP1 = [
  "// Process 1",
  "flag[1] = true;",
  "while (flag[0]) {",
  "  if (turn == 0) {",
  "    flag[1] = false;",
  "    while (turn == 0) {}",
  "    flag[1] = true;",
  "  }",
  "}",
  "// Critical Section",
  "turn = 0;",
  "flag[1] = false;",
];

export function initializeDekkerState(): DekkerState {
  return {
    flag: [false, false],
    turn: 0,
    processes: [
      {
        id: 0,
        name: 'Process 0',
        wantsToEnter: false,
        turn: 0,
        inCriticalSection: false,
        waiting: false,
        completed: false,
        position: 'idle',
      },
      {
        id: 1,
        name: 'Process 1',
        wantsToEnter: false,
        turn: 0,
        inCriticalSection: false,
        waiting: false,
        completed: false,
        position: 'idle',
      },
    ],
    steps: [],
    currentStep: 0,
  };
}

/**
 * Simulates Dekker's algorithm with a specific execution pattern
 * @param pattern Array of process IDs indicating which process attempts entry
 * @returns Array of steps showing the execution
 */
export function simulateDekker(pattern: number[]): DekkerStep[] {
  const steps: DekkerStep[] = [];
  let flag: [boolean, boolean] = [false, false];
  let turn = 0;
  let inCriticalSection: number | null = null;
  let stepNumber = 0;

  const addStep = (
    process: number,
    action: string,
    description: string,
    codeLineP0?: number,
    codeLineP1?: number
  ) => {
    steps.push({
      stepNumber: stepNumber++,
      process,
      action,
      description,
      codeLineP0,
      codeLineP1,
      flag0: flag[0],
      flag1: flag[1],
      turn,
      inCriticalSection,
    });
  };

  for (const pid of pattern) {
    // Process wants to enter
    flag[pid] = true;
    addStep(
      pid,
      'request',
      `Process ${pid} sets flag[${pid}] = true (wants to enter)`,
      pid === 0 ? 1 : undefined,
      pid === 1 ? 1 : undefined
    );

    // Check if other process wants to enter
    const other = 1 - pid;
    if (flag[other]) {
      addStep(
        pid,
        'check',
        `Process ${pid} sees flag[${other}] = true`,
        pid === 0 ? 2 : undefined,
        pid === 1 ? 2 : undefined
      );

      // Check turn
      if (turn === other) {
        // Back off
        flag[pid] = false;
        addStep(
          pid,
          'backoff',
          `Process ${pid} backs off (turn = ${other})`,
          pid === 0 ? 4 : undefined,
          pid === 1 ? 4 : undefined
        );

        // Wait for turn
        addStep(
          pid,
          'wait',
          `Process ${pid} waits for its turn`,
          pid === 0 ? 5 : undefined,
          pid === 1 ? 5 : undefined
        );

        // Assume turn changes (other process completes)
        turn = pid;
        addStep(other, 'setturn', `Process ${other} sets turn = ${pid}`, undefined, undefined);

        // Try again
        flag[pid] = true;
        addStep(
          pid,
          'retry',
          `Process ${pid} sets flag[${pid}] = true again`,
          pid === 0 ? 6 : undefined,
          pid === 1 ? 6 : undefined
        );
      }
    }

    // Enter critical section
    inCriticalSection = pid;
    addStep(
      pid,
      'enter',
      `Process ${pid} enters critical section`,
      pid === 0 ? 9 : undefined,
      pid === 1 ? 9 : undefined
    );

    // Execute in critical section
    addStep(pid, 'execute', `Process ${pid} executes in critical section`, undefined, undefined);

    // Leave critical section
    turn = other;
    addStep(
      pid,
      'setturn',
      `Process ${pid} sets turn = ${other}`,
      pid === 0 ? 10 : undefined,
      pid === 1 ? 10 : undefined
    );

    flag[pid] = false;
    inCriticalSection = null;
    addStep(
      pid,
      'exit',
      `Process ${pid} sets flag[${pid}] = false (exits)`,
      pid === 0 ? 11 : undefined,
      pid === 1 ? 11 : undefined
    );
  }

  return steps;
}

/**
 * Generates a random execution pattern
 */
export function generateRandomPattern(length: number): number[] {
  const pattern: number[] = [];
  for (let i = 0; i < length; i++) {
    pattern.push(Math.random() < 0.5 ? 0 : 1);
  }
  return pattern;
}
