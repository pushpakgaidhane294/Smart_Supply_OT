import numpy as np


def least_cost(costs, supply, demand):

    costs = np.array(costs, dtype=float)
    supply = np.array(supply, dtype=float).copy()
    demand = np.array(demand, dtype=float).copy()

    rows, cols = costs.shape

    allocation = np.zeros((rows, cols))

    active_rows = set(range(rows))
    active_cols = set(range(cols))

    steps = []

    while active_rows and active_cols:

        min_cost = float("inf")
        selected_row = None
        selected_col = None

        for i in active_rows:
            for j in active_cols:

                if costs[i][j] < min_cost:
                    min_cost = costs[i][j]
                    selected_row = i
                    selected_col = j

        quantity = min(
            supply[selected_row],
            demand[selected_col]
        )

        allocation[selected_row][selected_col] = quantity

        steps.append({
            "source_index": selected_row,
            "destination_index": selected_col,
            "unit_cost": float(min_cost),
            "quantity": float(quantity)
        })

        supply[selected_row] -= quantity
        demand[selected_col] -= quantity

        if np.isclose(supply[selected_row], 0):
            active_rows.remove(selected_row)

        if np.isclose(demand[selected_col], 0):
            active_cols.remove(selected_col)

    return {
        "method": "Least Cost",
        "allocation": allocation.tolist(),
        "steps": steps
    }