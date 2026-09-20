import numpy as np


def validate_problem(costs, supply, demand):
    """
    Validate a transportation problem.
    """

    costs = np.array(costs, dtype=float)
    supply = np.array(supply, dtype=float)
    demand = np.array(demand, dtype=float)

    if costs.ndim != 2:
        raise ValueError("Cost matrix must be 2-dimensional.")

    if len(supply) != costs.shape[0]:
        raise ValueError(
            "Number of supply values must match number of sources."
        )

    if len(demand) != costs.shape[1]:
        raise ValueError(
            "Number of demand values must match number of destinations."
        )

    if np.any(costs < 0):
        raise ValueError("Transportation costs cannot be negative.")

    if np.any(supply < 0):
        raise ValueError("Supply values cannot be negative.")

    if np.any(demand < 0):
        raise ValueError("Demand values cannot be negative.")

    return True


def balance_problem(costs, supply, demand):
    """
    Balance an unbalanced transportation problem.

    If total supply > total demand:
        Add a dummy destination.

    If total demand > total supply:
        Add a dummy source.

    Dummy transportation cost = 0.
    """

    costs = np.array(costs, dtype=float)
    supply = np.array(supply, dtype=float)
    demand = np.array(demand, dtype=float)

    total_supply = supply.sum()
    total_demand = demand.sum()

    balanced_costs = costs.copy()
    balanced_supply = supply.copy()
    balanced_demand = demand.copy()

    balance_info = {
        "was_balanced": True,
        "dummy_added": None,
        "dummy_quantity": 0
    }

    # Already balanced
    if np.isclose(total_supply, total_demand):
        return (
            balanced_costs,
            balanced_supply,
            balanced_demand,
            balance_info
        )

    # Excess supply
    if total_supply > total_demand:

        difference = total_supply - total_demand

        dummy_column = np.zeros(
            (balanced_costs.shape[0], 1)
        )

        balanced_costs = np.hstack(
            (balanced_costs, dummy_column)
        )

        balanced_demand = np.append(
            balanced_demand,
            difference
        )

        balance_info = {
            "was_balanced": False,
            "dummy_added": "destination",
            "dummy_quantity": float(difference)
        }

    # Excess demand
    else:

        difference = total_demand - total_supply

        dummy_row = np.zeros(
            (1, balanced_costs.shape[1])
        )

        balanced_costs = np.vstack(
            (balanced_costs, dummy_row)
        )

        balanced_supply = np.append(
            balanced_supply,
            difference
        )

        balance_info = {
            "was_balanced": False,
            "dummy_added": "source",
            "dummy_quantity": float(difference)
        }

    return (
        balanced_costs,
        balanced_supply,
        balanced_demand,
        balance_info
    )


def calculate_total_cost(allocation, costs):
    """
    Calculate total transportation cost.
    """

    allocation = np.array(allocation, dtype=float)
    costs = np.array(costs, dtype=float)

    return float(np.sum(allocation * costs))


def validate_solution(allocation, supply, demand):
    """
    Check whether an allocation satisfies
    all supply and demand constraints.
    """

    allocation = np.array(allocation, dtype=float)
    supply = np.array(supply, dtype=float)
    demand = np.array(demand, dtype=float)

    row_totals = allocation.sum(axis=1)
    column_totals = allocation.sum(axis=0)

    supply_ok = np.allclose(row_totals, supply)
    demand_ok = np.allclose(column_totals, demand)

    return supply_ok and demand_ok