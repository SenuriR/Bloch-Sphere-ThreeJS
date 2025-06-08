import sys
import json
import pennylane as qml
import numpy as np

# Read input from stdin (Node.js is passing circuit JSON here)
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

# Initialize PennyLane device
dev = qml.device("default.qubit", wires=n_qubits)

# Dictionary for LaTeX gate matrices
gate_matrices = {
    "X": r"\begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}",
    "Y": r"\begin{bmatrix} 0 & -i \\ i & 0 \end{bmatrix}",
    "Z": r"\begin{bmatrix} 1 & 0 \\ 0 & -1 \end{bmatrix}",
    "H": r"\frac{1}{\sqrt{2}}\begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix}",
    "S": r"\begin{bmatrix} 1 & 0 \\ 0 & i \end{bmatrix}",
    "T": r"\begin{bmatrix} 1 & 0 \\ 0 & e^{i \pi/4} \end{bmatrix}",
    "CNOT": r"\begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \end{bmatrix}"
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

# Build simplified braket notation string
def statevector_to_braket(state):
    terms = []
    for i, amp in enumerate(state):
        if np.abs(amp) > 1e-3:  # skip very small amplitudes
            formatted_amp = format_complex(amp)
            ket = f"|{format(i, f'0{n_qubits}b')}\\rangle"
            terms.append(f"{formatted_amp}{ket}")
    return " + ".join(terms) if terms else "0"

# Build full circuit function
@qml.qnode(dev)
def full_circuit():
    for op in circuit_description:
        if op["gate"] == "X":
            qml.PauliX(op["qubit"])
        elif op["gate"] == "Y":
            qml.PauliY(op["qubit"])
        elif op["gate"] == "Z":
            qml.PauliZ(op["qubit"])
        elif op["gate"] == "H":
            qml.Hadamard(op["qubit"])
        elif op["gate"] == "S":
            qml.PhaseShift(np.pi/2, wires=op["qubit"])
        elif op["gate"] == "T":
            qml.PhaseShift(np.pi/4, wires=op["qubit"])
        elif op["gate"] == "CNOT":
            qml.CNOT(wires=[op["control"], op["target"]])
    return qml.state()

# Run full circuit to get final statevector
state = full_circuit()

# Generate step-by-step LaTeX evolution
latex_steps = []
partial_ops = []

for idx, op in enumerate(circuit_description):
    partial_ops.append(op)

    @qml.qnode(dev)
    def partial_circuit():
        for p_op in partial_ops:
            if p_op["gate"] == "X":
                qml.PauliX(p_op["qubit"])
            elif p_op["gate"] == "Y":
                qml.PauliY(p_op["qubit"])
            elif p_op["gate"] == "Z":
                qml.PauliZ(p_op["qubit"])
            elif p_op["gate"] == "H":
                qml.Hadamard(p_op["qubit"])
            elif p_op["gate"] == "S":
                qml.PhaseShift(np.pi/2, wires=p_op["qubit"])
            elif p_op["gate"] == "T":
                qml.PhaseShift(np.pi/4, wires=p_op["qubit"])
            elif p_op["gate"] == "CNOT":
                qml.CNOT(wires=[p_op["control"], p_op["target"]])
        return qml.state()

    partial_state = partial_circuit()

    # Format statevector as matrix form for LaTeX
    ket_before = r"\begin{bmatrix} " + r" \\ ".join(format_complex(ampl) for ampl in partial_state) + r" \end{bmatrix}"

    # Determine gate label for LaTeX
    if op["gate"] == "CNOT":
        gate_label = f"{gate_matrices['CNOT']}^{{ctrl={op['control']}, target={op['target']}}}"
    else:
        gate_label = gate_matrices[op["gate"]]

    # Build braket notation
    braket_after = statevector_to_braket(partial_state)

    # Full LaTeX string
    latex = rf"|\psi\rangle = {op['gate']}|\psi\rangle = {gate_label} \cdot {ket_before} = {braket_after}"
    latex_steps.append(latex)

# PURE NumPy Bloch sphere calculations:
def compute_bloch_vector(statevector, qubit_index, n_qubits):
    reshaped = np.reshape(statevector, [2]*n_qubits)

    # Partial trace over all other qubits
    axes = tuple(i for i in range(n_qubits) if i != qubit_index)
    rho = np.tensordot(reshaped, np.conj(reshaped), axes=(axes, axes))

    # Reduced density matrix for target qubit
    bloch_x = 2 * np.real(rho[0, 1])
    bloch_y = 2 * np.imag(rho[1, 0])
    bloch_z = np.real(rho[0, 0] - rho[1, 1])

    purity = np.trace(rho @ rho).real

    return [bloch_x, bloch_y, bloch_z], purity

# Calculate Bloch vectors for all qubits
bloch_spheres = {}

for qubit_index in range(n_qubits):
    bloch_vec, purity = compute_bloch_vector(state, qubit_index, n_qubits)
    bloch_spheres[qubit_index] = {
        "bloch_vector": bloch_vec,
        "purity": purity
    }

# Final output to frontend
output = {
    "steps": latex_steps,
    "bloch_spheres": bloch_spheres
}

print(json.dumps(output))
