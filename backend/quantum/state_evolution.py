# state_evolution.py
import sys
import json
import pennylane as qml
import numpy as np

input_data = sys.stdin.read()
data = json.loads(input_data)
circuit_description = data.get("circuit", [])

# Find number of qubits
max_wire = 0
for op in circuit_description:
    if op["gate"] == "CNOT":
        max_wire = max(max_wire, op["control"], op["target"])
    else:
        max_wire = max(max_wire, op["qubit"])
n_qubits = max_wire + 1

dev = qml.device("default.qubit", wires=n_qubits)

# Build gates mapping
gate_map = {
    "H": qml.Hadamard,
    "X": qml.PauliX,
    "Y": qml.PauliY,
    "Z": qml.PauliZ
}

# Function to build latex for each step
def gate_to_latex(op, state_before, state_after):
    gate = op["gate"]

    if gate == "CNOT":
        latex = f"\\[CNOT(control={op['control']}, target={op['target']})\\]"
    else:
        gate_tex = {
            "H": "\\frac{1}{\\sqrt{2}} \\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}",
            "X": "\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}",
            "Y": "\\begin{bmatrix} 0 & -i \\\\ i & 0 \\end{bmatrix}",
            "Z": "\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}"
        }
        latex = f"\\[|\\psi\\rangle = {gate} |\\psi\\rangle = {gate_tex[gate]} \\dots = {format_state(state_after)}\\]"

    return latex

# Function to nicely format statevector for LaTeX
def format_state(state):
    return "\\begin{bmatrix} " + " \\\\ ".join([f"{amp.real:.2f} {('+ ' if amp.imag >= 0 else '- ')} {abs(amp.imag):.2f}i" if abs(amp.imag) > 1e-2 else f"{amp.real:.2f}" for amp in state]) + " \\end{bmatrix}"

# Stepwise simulation
statevector_steps = []

@qml.qnode(dev)
def apply_all():
    state = np.zeros(2**n_qubits, dtype=complex)
    state[0] = 1.0  # initial |0...0⟩ state

    for op in circuit_description:
        if op["gate"] == "CNOT":
            qml.CNOT(wires=[op["control"], op["target"]])
        else:
            gate_map[op["gate"]](wires=op["qubit"])

    return qml.state()

# Actual step-by-step state tracking
state = np.zeros(2**n_qubits, dtype=complex)
state[0] = 1.0

for i, op in enumerate(circuit_description):
    dev = qml.device("default.qubit", wires=n_qubits)

    @qml.qnode(dev)
    def subcircuit():
        qml.QubitStateVector(state, wires=range(n_qubits))
        if op["gate"] == "CNOT":
            qml.CNOT(wires=[op["control"], op["target"]])
        else:
            gate_map[op["gate"]](wires=op["qubit"])
        return qml.state()

    state_after = subcircuit()
    statevector_steps.append(gate_to_latex(op, state, state_after))
    state = state_after

output = {
    "latex": statevector_steps
}

print(json.dumps(output))
