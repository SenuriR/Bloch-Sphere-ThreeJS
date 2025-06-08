import numpy as np
import pennylane as qml
import pytest

# Helper function to calculate expected state manually
def apply_single_gate(gate_matrix, initial_state):
    return np.dot(gate_matrix, initial_state)

# Common initial state |0>
initial_state = np.array([1, 0], dtype=complex)

# Gate matrices
S_matrix = np.array([[1, 0],
                     [0, 1j]], dtype=complex)

T_matrix = np.array([[1, 0],
                     [0, np.exp(1j * np.pi / 4)]], dtype=complex)

@pytest.mark.parametrize("gate_name, qml_gate, expected_matrix", [
    ("S", lambda wires: qml.PhaseShift(np.pi/2, wires=wires), S_matrix),
    ("T", lambda wires: qml.PhaseShift(np.pi/4, wires=wires), T_matrix)
])
def test_single_qubit_gates(gate_name, qml_gate, expected_matrix):
    dev = qml.device("default.qubit", wires=1)

    @qml.qnode(dev)
    def circuit():
        qml_gate(0)
        return qml.state()

    result = circuit()

    expected_state = apply_single_gate(expected_matrix, initial_state)

    # Use np.allclose for complex tolerance
    assert np.allclose(result, expected_state, atol=1e-8), f"{gate_name} gate failed"

