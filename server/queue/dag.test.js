// Unit tests for DAG utilities (topological sort, cycle detection, DOT generation)
import { topologicalSort, detectCycle, generatePipelineDot } from './dag.js';

describe('DAG Utilities', () => {
  describe('topologicalSort', () => {
    test('should return empty sorted array for empty input', () => {
      const { sorted, hasCycle } = topologicalSort([]);
      expect(sorted).toHaveLength(0);
      expect(hasCycle).toBe(false);
    });

    test('should sort agents with no dependencies', () => {
      const agents = [
        { id: 'a1', dependsOn: [] },
        { id: 'a2', dependsOn: [] },
        { id: 'a3', dependsOn: [] }
      ];
      const { sorted, hasCycle } = topologicalSort(agents);
      expect(sorted).toHaveLength(3);
      expect(hasCycle).toBe(false);
      // All should be in sorted (order doesn't matter for no deps)
      expect(sorted.map(a => a.id)).toContain('a1');
      expect(sorted.map(a => a.id)).toContain('a2');
      expect(sorted.map(a => a.id)).toContain('a3');
    });

    test('should sort agents with dependencies', () => {
      const agents = [
        { id: 'a3', dependsOn: ['a1', 'a2'] },
        { id: 'a1', dependsOn: [] },
        { id: 'a2', dependsOn: ['a1'] }
      ];
      const { sorted, hasCycle } = topologicalSort(agents);
      expect(sorted).toHaveLength(3);
      expect(hasCycle).toBe(false);

      // a1 should come first (no deps)
      expect(sorted[0].id).toBe('a1');
      // a2 depends on a1, so a2 comes after a1
      expect(sorted[1].id).toBe('a2');
      // a3 depends on a1 and a2, so a3 comes last
      expect(sorted[2].id).toBe('a3');
    });

    test('should detect cycle', () => {
      const agents = [
        { id: 'a1', dependsOn: ['a2'] },
        { id: 'a2', dependsOn: ['a3'] },
        { id: 'a3', dependsOn: ['a1'] } // Cycle: a1 -> a2 -> a3 -> a1
      ];
      const { sorted, hasCycle, cyclePath } = topologicalSort(agents);
      expect(hasCycle).toBe(true);
      expect(sorted).toHaveLength(0); // Nothing sorted if cycle
      expect(cyclePath.length).toBeGreaterThan(0);
    });

    test('should handle self-dependency as cycle', () => {
      const agents = [
        { id: 'a1', dependsOn: ['a1'] } // Self-cycle
      ];
      const { hasCycle } = topologicalSort(agents);
      expect(hasCycle).toBe(true);
    });
  });

  describe('detectCycle', () => {
    test('should return false for no dependencies', () => {
      const dependsOnMap = { a1: [], a2: [], a3: [] };
      const allAgentIds = ['a1', 'a2', 'a3'];
      expect(detectCycle(dependsOnMap, allAgentIds)).toBe(false);
    });

    test('should return false for valid dependencies', () => {
      const dependsOnMap = { a1: [], a2: ['a1'], a3: ['a1', 'a2'] };
      const allAgentIds = ['a1', 'a2', 'a3'];
      expect(detectCycle(dependsOnMap, allAgentIds)).toBe(false);
    });

    test('should return true for simple cycle', () => {
      const dependsOnMap = { a1: ['a2'], a2: ['a1'] };
      const allAgentIds = ['a1', 'a2'];
      expect(detectCycle(dependsOnMap, allAgentIds)).toBe(true);
    });

    test('should return true for longer cycle', () => {
      const dependsOnMap = { a1: ['a2'], a2: ['a3'], a3: ['a1'] };
      const allAgentIds = ['a1', 'a2', 'a3'];
      expect(detectCycle(dependsOnMap, allAgentIds)).toBe(true);
    });

    test('should handle missing agent IDs gracefully', () => {
      const dependsOnMap = { a1: ['nonexistent'] };
      const allAgentIds = ['a1'];
      // Should not throw, just ignore nonexistent deps
      expect(detectCycle(dependsOnMap, allAgentIds)).toBe(false);
    });
  });

  describe('generatePipelineDot', () => {
    test('should generate empty digraph for no agents', () => {
      const dot = generatePipelineDot([]);
      expect(dot).toContain('digraph Pipeline');
      expect(dot).toContain('}');
    });

    test('should generate DOT with dependencies', () => {
      const agents = [
        { id: 'a1', dependsOn: [], skill: 'triage' },
        { id: 'a2', dependsOn: ['a1'], skill: 'planner' }
      ];
      const dot = generatePipelineDot(agents);
      expect(dot).toContain('triage -> planner;');
      expect(dot).toContain('a1');
      expect(dot).toContain('a2');
    });

    test('should include nodes without dependencies', () => {
      const agents = [
        { id: 'a1', dependsOn: [], skill: 'triage' }
      ];
      const dot = generatePipelineDot(agents);
      expect(dot).toContain('triage;');
    });

    test('should handle multiple dependencies', () => {
      const agents = [
        { id: 'a1', dependsOn: [], skill: 'triage' },
        { id: 'a2', dependsOn: [], skill: 'planner' },
        { id: 'a3', dependsOn: ['a1', 'a2'], skill: 'coder' }
      ];
      const dot = generatePipelineDot(agents);
      expect(dot).toContain('triage -> coder;');
      expect(dot).toContain('planner -> coder;');
    });
  });
});

// Simple test runner for environments without Jest
if (typeof describe === 'undefined') {
  console.log('No test runner detected. Install Jest for proper testing.');
  console.log('Basic validation:');
  
  // Manual test for topologicalSort
  const agents = [
    { id: 'a3', dependsOn: ['a1', 'a2'] },
    { id: 'a1', dependsOn: [] },
    { id: 'a2', dependsOn: ['a1'] }
  ];
  const { sorted, hasCycle } = topologicalSort(agents);
  console.log('topologicalSort test:', !hasCycle && sorted[0].id === 'a1' ? 'PASS' : 'FAIL');
  
  // Manual test for detectCycle
  const cycleMap = { a1: ['a2'], a2: ['a1'] };
  console.log('detectCycle test:', detectCycle(cycleMap, ['a1', 'a2']) === true ? 'PASS' : 'FAIL');
  
  console.log('DAG tests complete.');
}
