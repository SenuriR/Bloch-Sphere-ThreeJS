# backend/quantum/circuit_diagram.py

import sys
import json
from qiskit import QuantumCircuit

# Read input from stdin
input_data = sys.stdin.read()
data = json.loads(input_data)
circuit_description = data.get("circuit", [])

# Determine number of qubits
qubit_indices = set()
for op in circuit_description:
    if "qubit" in op:
        qubit_indices.add(op["qubit"])
    if "control" in op:
        qubit_indices.add(op["control"])
    if "target" in op:
        qubit_indices.add(op["target"])

n_qubits = max(qubit_indices) + 1 if qubit_indices else 1

# Build Qiskit circuit
qc = QuantumCircuit(n_qubits)

for op in circuit_description:
    gate = op["gate"]

    if gate == "CNOT":
        qc.cx(op["control"], op["target"])
    elif gate == "H":
        qc.h(op["qubit"])
    elif gate == "X":
        qc.x(op["qubit"])
    elif gate == "Y":
        qc.y(op["qubit"])
    elif gate == "Z":
        qc.z(op["qubit"])
    elif gate == "S":
        qc.s(op["qubit"])
    elif gate == "T":
        qc.t(op["qubit"])
    else:
        pass  # unknown gate

# Generate ASCII diagram
ascii_diagram = qc.draw(output='text').single_string()

# Output JSON back to Node.js
print(json.dumps({"diagram": ascii_diagram}))
