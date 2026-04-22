# Technical Context

## Language

- **Primary**: Python (prototype) → C/Rust (target)

## Stack

- **Framework**: ROS 2 (rclpy)
- **Build System**: colcon
- **Simulation**: Gazebo + MATLAB/SCilab (à déterminer)

## Structure

- **Architecture**: Hexagonale (ports & adapters)
- **Modules RTOS (critique)**: Boucle contrôle, SNN, watchdog, emergency stop, cmd moteur
- **Modules Linux (non critique)**: Transformer, logique complexe, ROS 2, logging/debug
- **Communication**: Shared Memory

## Tests

- **Test Framework**: pytest

## Linting

- **Linter**: ruff

## CI/CD

- **CI/CD**: Not defined

## Storage

- **Storage**: Not defined

## Performance

- **Performance Constraints**:
  - Boucle contrôle < 10 ms
  - WCET maîtrisé
  - Déterminisme strict
  - Pas de malloc dynamique

---

*Author: Synaptix Team*
*Last modified: 2026-04-13*