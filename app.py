from flask import Flask, render_template, jsonify, request
import os
import pandas as pd

from optimization import (
    validate_problem,
    balance_problem,
    calculate_total_cost,
    northwest_corner,
    least_cost,
    vogel_approximation,
)

app = Flask(__name__)

DATA_PATH = os.path.join(
    os.path.dirname(__file__),
    "data",
    "sample_transportation.csv",
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/sample-data", methods=["GET"])
def sample_data():
    try:
        df = pd.read_csv(DATA_PATH)

        sources = df["source"].drop_duplicates().tolist()
        destinations = df["destination"].drop_duplicates().tolist()

        cost_matrix = []

        for source in sources:
            row = []

            for destination in destinations:
                match = df[
                    (df["source"] == source)
                    & (df["destination"] == destination)
                ]

                if match.empty:
                    raise ValueError(
                        f"Missing transportation cost: {source} → {destination}"
                    )

                row.append(float(match.iloc[0]["cost"]))

            cost_matrix.append(row)

        # Balanced sample problem:
        # 500 + 400 + 600 = 1500
        # 450 + 550 + 500 + 0 = 1500
        supply = [500, 400, 600]
        demand = [450, 550, 500, 0]

        return jsonify(
            {
                "success": True,
                "sources": sources,
                "destinations": destinations,
                "costs": cost_matrix,
                "supply": supply,
                "demand": demand,
            }
        )

    except Exception as exc:
        return jsonify(
            {
                "success": False,
                "error": str(exc),
            }
        ), 500


@app.route("/api/optimize", methods=["POST"])
def optimize():
    try:
        data = request.get_json(silent=True)

        if not data:
            raise ValueError("No transportation problem was received.")

        sources = data["sources"]
        destinations = data["destinations"]
        costs = data["costs"]
        supply = data["supply"]
        demand = data["demand"]

        validate_problem(costs, supply, demand)

        (
            balanced_costs,
            balanced_supply,
            balanced_demand,
            balance_info,
        ) = balance_problem(
            costs,
            supply,
            demand,
        )

        nw_result = northwest_corner(
            balanced_costs,
            balanced_supply,
            balanced_demand,
        )

        lc_result = least_cost(
            balanced_costs,
            balanced_supply,
            balanced_demand,
        )

        vam_result = vogel_approximation(
            balanced_costs,
            balanced_supply,
            balanced_demand,
        )

        nw_cost = calculate_total_cost(
            nw_result["allocation"],
            balanced_costs,
        )

        lc_cost = calculate_total_cost(
            lc_result["allocation"],
            balanced_costs,
        )

        vam_cost = calculate_total_cost(
            vam_result["allocation"],
            balanced_costs,
        )

        final_sources = list(sources)
        final_destinations = list(destinations)

        if balance_info["dummy_added"] == "source":
            final_sources.append("Dummy Source")

        elif balance_info["dummy_added"] == "destination":
            final_destinations.append("Dummy Destination")

        comparison = [
            {
                "method": "Northwest Corner",
                "cost": round(float(nw_cost), 2),
            },
            {
                "method": "Least Cost",
                "cost": round(float(lc_cost), 2),
            },
            {
                "method": "Vogel's Approximation",
                "cost": round(float(vam_cost), 2),
            },
        ]

        return jsonify(
            {
                "success": True,
                "sources": final_sources,
                "destinations": final_destinations,
                "costs": balanced_costs.tolist(),
                "supply": balanced_supply.tolist(),
                "demand": balanced_demand.tolist(),
                "balance": balance_info,
                "results": {
                    "northwest_corner": {
                        "allocation": nw_result["allocation"],
                        "cost": round(float(nw_cost), 2),
                        "steps": nw_result.get("steps", []),
                    },
                    "least_cost": {
                        "allocation": lc_result["allocation"],
                        "cost": round(float(lc_cost), 2),
                        "steps": lc_result.get("steps", []),
                    },
                    "vogel": {
                        "allocation": vam_result["allocation"],
                        "cost": round(float(vam_cost), 2),
                        "steps": vam_result.get("steps", []),
                    },
                },
                "comparison": comparison,
            }
        )

    except Exception as exc:
        return jsonify(
            {
                "success": False,
                "error": str(exc),
            }
        ), 400


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True,
    )
