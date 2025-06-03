# backend/quantum/state_evolution.py

import sys
import json
import pennylane as qml
import numpy as np

# Read input from stdin
input_data = sys.stdin.read()
data = json.loads(input_data)
circuit_description = data.get("circuit", [])

# Determine number of qubits
max_wire = 0
for op in circuit_description:
    if op["gate"] == "CNOT":
        max_wire = max(max_wire, op["control"], op["target"])
    else:
        max_wire = max(max_wire, op["qubit"])
n_qubits = max_wire + 1

# Initialize empty state: |00...0>
initial_state = np.zeros(2**n_qubits, dtype=complex)
initial_state[0] = 1.0

# Use PennyLane device to simulate step-by-step evolution
dev = qml.device("default.qubit", wires=n_qubits)

# Define gate matrix dictionary for LaTeX generation
gate_matrices = {
    "X": r"\begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}",
    "Y": r"\begin{bmatrix} 0 & -i \\ i & 0 \end{bmatrix}",
    "Z": r"\begin{bmatrix} 1 & 0 \\ 0 & -1 \end{bmatrix}",
    "H": r"\frac{1}{\sqrt{2}}\begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix}",
    "CNOT": r"\text{CNOT}"
}

# Helper for formatting complex numbers for LaTeX
def format_complex(z):
    re = np.round(z.real, 2)
    im = np.round(z.imag, 2)
    if np.abs(im) < 1e-2:
        return f"{re:.2f}"
    elif np.abs(re) < 1e-2:
        return f"{im:.2f}i"
    else:
        sign = '+' if im >= 0 else '-'
        return f"{re:.2f}{sign}{np.abs(im):.2f}i"

# Function to apply circuit up to certain step
def build_qnode(ops):
    @qml.qnode(dev)
    def circuit():
        for op in ops:
            if op["gate"] == "X":
                qml.PauliX(op["qubit"])
            elif op["gate"] == "Y":
                qml.PauliY(op["qubit"])
            elif op["gate"] == "Z":
                qml.PauliZ(op["qubit"])
            elif op["gate"] == "H":
                qml.Hadamard(op["qubit"])
            elif op["gate"] == "CNOT":
                qml.CNOT(wires=[op["control"], op["target"]])
        return qml.state()
    return circuit

# Perform step-by-step evolution
latex_steps = []
partial_ops = []

for idx, op in enumerate(circuit_description):
    partial_ops.append(op)
    circuit = build_qnode(partial_ops)
    state = circuit()

    # LaTeX for this step
    ket_before = r"\begin{bmatrix} " + r" \\ ".join(format_complex(ampl) for ampl in state) + r" \end{bmatrix}"

    if op["gate"] == "CNOT":
        gate_label = f"{gate_matrices['CNOT']}^{{ctrl={op['control']}, target={op['target']}}}"
    else:
        gate_label = gate_matrices[op["gate"]]

    latex = rf"|\psi\rangle = {op['gate']}|\psi\rangle = {gate_label} \cdot {ket_before}"
    latex_steps.append(latex)

# Output full LaTeX evolution
output = {
    "steps": latex_steps
}

print(json.dumps(output))
