import argparse
import matplotlib.pyplot as plt
from plot import create_plot
from data import get_data


def main(save: bool, file_path: str, symbol: str, band_width: float,  decrease: float):
    # Load data
    raw_data, popt = get_data(f"data/{symbol.lower()}_data.csv")

    # Create plot
    create_plot(symbol.lower(), raw_data, popt, band_width, decrease)

    # Show plot
    if save:
        plt.savefig(file_path, bbox_inches="tight", dpi=300)
        print(f"Plot saved to {file_path}")
    else:
        plt.show()


if __name__ == "__main__":
    # Set up command-line argument parsing
    parser = argparse.ArgumentParser(description="Generate and save or display a plot.")
    parser.add_argument(
        "--save",
        action="store_true",
        help="Save the plot to a file instead of displaying it.",
    )
    parser.add_argument(
        "--file_path",
        type=str,
        default="img/rainbow_chart.png",
        help="Path to save the plot (used only if --save is specified).",
    )
    parser.add_argument(
        "--symbol",
        type=str,
        default="bitcoin",
        help="Which chart to generate",
    )
    
    parser.add_argument(
        "--width",
        type=float,
        default="0.40",
        help="Width of the bands (default: 0.40)",
    )
    
    parser.add_argument(
        "--offset",
        type=float,
        default="1.5",
        help="Adjusts the offset of the rainbow to better align with peaks and troughs of the chart (default: 1.5)",
    )
    
    
    args = parser.parse_args()

    # Call main with parsed arguments
    main(save=args.save, file_path=args.file_path, symbol=args.symbol, band_width=args.width, decrease=args.offset)
