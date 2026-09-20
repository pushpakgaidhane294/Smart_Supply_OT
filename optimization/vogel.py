import numpy as np


def vogel_approximation(costs, supply, demand):

    costs = np.array(costs, dtype=float)
    supply = np.array(supply, dtype=float).copy()
    demand = np.array(demand, dtype=float).copy()

    rows, cols = costs.shape

    allocation = np.zeros((rows, cols))

    active_rows = set(range(rows))
    active_cols = set(range(cols))

    steps = []

    while active_rows and active_cols:

        row_penalties = {}
        col_penalties = {}

        # Calculate row penalties
        for i in active_rows:

            row_costs = [
                costs[i][j]
                for j in active_cols
            ]

            sorted_costs = sorted(row_costs)

            if len(sorted_costs) >= 2:
                penalty = sorted_costs[1] - sorted_costs[0]
            else:
                penalty = sorted_costs[0]

            row_penalties[i] = penalty

        # Calculate column penalties
        for j in active_cols:

            col_costs = [
                costs[i][j]
                for i in active_rows
            ]

            sorted_costs = sorted(col_costs)

            if len(sorted_costs) >= 2:
                penalty = sorted_costs[1] - sorted_costs[0]
            else:
                penalty = sorted_costs[0]

            col_penalties[j] = penalty

        max_row_penalty = (
            max(row_penalties.values())
            if row_penalties else -1
        )

        max_col_penalty = (
            max(col_penalties.values())
            if col_penalties else -1
        )

        # Select row or column with highest penalty
        if max_row_penalty >= max_col_penalty:

            selected_row = max(
                row_penalties,
                key=row_penalties.get
            )

            selected_col = min(
                active_cols,
                key=lambda j: costs[selected_row][j]
            )

            selected_penalty = max_row_penalty

        else:

            selected_col = max(
                col_penalties,
                key=col_penalties.get
            )

            selected_row = min(
                active_rows,
                key=lambda i: costs[i][selected_col]
            )

            selected_penalty = max_col_penalty

        quantity = min(
            supply[selected_row],
            demand[selected_col]
        )

        allocation[selected_row][selected_col] = quantity

        steps.append({
            "source_index": selected_row,
            "destination_index": selected_col,
            "unit_cost": float(costs[selected_row][selected_col]),
            "penalty": float(selected_penalty),
            "quantity": float(quantity)
        })

        supply[selected_row] -= quantity
        demand[selected_col] -= quantity

        if np.isclose(supply[selected_row], 0):
            active_rows.remove(selected_row)

        if np.isclose(demand[selected_col], 0):
            active_cols.remove(selected_col)

    return {
        "method": "Vogel's Approximation Method",
        "allocation": allocation.tolist(),
        "steps": steps
    }