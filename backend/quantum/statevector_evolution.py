import sys
import json
import pennylane as qml
import numpy as np

# Read input
input_data = sys.stdin.read()
data = json.loads(input_data)
circuit_description = data.get("circuit", [])

# Determine required qubits
max_wire = 0
for op in circuit_description:
    if op["gate"] == "CNOT":
        max_wire = max(max_wire, op["control"], op["target"])
    else:
        max_wire = max(max_wire, op["qubit"])

n_qubits = max_wire + 1

dev = qml.device("default.qubit", wires=n_qubits)

# Helper: Format complex numbers for LaTeX
def format_complex(z):
    re = np.round(z.real, 2)
    im = np.round(z.imag, 2)
    if np.isclose(im, 0): return f"{re:.2f}"
    if np.isclose(re, 0): return f"{im:.2f}i"
    return f"{re:.2f} {'-' if im < 0 else '+'} {abs(im):.2f}i"

# Helper: LaTeX matrix format
def latex_vector(state):
    return "\\begin{bmatrix} " + " \\\\ ".join(format_complex(a) for a in state) + " \\end{bmatrix}"

# Main evolution
statevector = np.array([1] + [0]*(2**n_qubits - 1), dtype=complex)
steps = []

for op in circuit_description:
    qml_tape = qml.tape.QuantumTape()
    if op["gate"] == "H":
        qml_tape._ops.append(qml.Hadamard(wires=op["qubit"]))
        gate_latex = "\\frac{1}{\\sqrt{2}} \\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}"
    elif op["gate"] == "X":
        qml_tape._ops.append(qml.PauliX(wires=op["qubit"]))
        gate_latex = "\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}"
    elif op["gate"] == "Y":
        qml_tape._ops.append(qml.PauliY(wires=op["qubit"]))
        gate_latex = "\\begin{bmatrix} 0 & -i \\\\ i & 0 \\end{bmatrix}"
    elif op["gate"] == "Z":
        qml_tape._ops.append(qml.PauliZ(wires=op["qubit"]))
        gate_latex = "\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}"
    elif op["gate"] == "CNOT":
        qml_tape._ops.append(qml.CNOT(wires=[op["control"], op["target"]]))
        gate_latex = "\\mathrm{CNOT}"

    # Apply operation
    matrix = qml.matrix(qml_tape)[0]
    statevector = np.dot(matrix, statevector)

    # Build LaTeX log
    latex_line = f"\\[|\\psi\\rangle = {op['gate']} |\\psi\\rangle = {gate_latex} {latex_vector(statevector)} \\]"
    steps.append(latex_line)

# Return result
output = { "latex_steps": steps }
print(json.dumps(output))
