import numpy as np


def northwest_corner(costs, supply, demand):

    supply = np.array(supply, dtype=float).copy()
    demand = np.array(demand, dtype=float).copy()

    rows = len(supply)
    cols = len(demand)

    allocation = np.zeros((rows, cols))

    i = 0
    j = 0

    steps = []

    while i < rows and j < cols:

        quantity = min(supply[i], demand[j])

        allocation[i][j] = quantity

        steps.append({
            "source_index": i,
            "destination_index": j,
            "quantity": float(quantity)
        })

        supply[i] -= quantity
        demand[j] -= quantity

        if np.isclose(supply[i], 0):
            i += 1

        if np.isclose(demand[j], 0):
            j += 1

    return {
        "method": "Northwest Corner",
        "allocation": allocation.tolist(),
        "steps": steps
    }