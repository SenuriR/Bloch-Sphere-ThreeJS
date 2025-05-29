# backend/quantum/circuit_diagram.py
import sys
import json
import pennylane as qml

# Read input from stdin
input_data = sys.stdin.read()
data = json.loads(input_data)
circuit_description = data.get("circuit", [])

# Determine number of qubits
if circuit_description:
    qubit_indices = []
    for op in circuit_description:
        if "qubit" in op:
            qubit_indices.append(op["qubit"])
        if "control" in op:
            qubit_indices.append(op["control"])
        if "target" in op:
            qubit_indices.append(op["target"])
    n_qubits = max(qubit_indices) + 1
else:
    n_qubits = 1

dev = qml.device("default.qubit", wires=n_qubits)

def make_circuit():
    for op in circuit_description:
        gate = op["gate"]
        if gate == "CNOT":
            qml.CNOT(wires=[op["control"], op["target"]])
        elif gate == "H":
            qml.Hadamard(wires=op["qubit"])
        elif gate == "X":
            qml.PauliX(wires=op["qubit"])
        elif gate == "Y":
            qml.PauliY(wires=op["qubit"])
        elif gate == "Z":
            qml.PauliZ(wires=op["qubit"])

# Generate ASCII circuit diagram
drawn = qml.draw(make_circuit, wire_order=range(n_qubits))
ascii_diagram = drawn()

# Output the diagram
print(json.dumps({"diagram": ascii_diagram}))
