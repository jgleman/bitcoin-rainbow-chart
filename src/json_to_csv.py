import argparse
import json
import csv
from pathlib import Path

def main(symbol: str):
	
	# File paths
	data_file = Path(f"./rawdata/{symbol}-historical-data.json")
	output_file = Path(f"./data/{symbol}_data.csv")
	
	try:
		# Load the JSON data
		with data_file.open("r") as file:
			data = json.load(file)

		# Extract and sort values by date
		values = data.get("values", [])
		sorted_values = sorted(values, key=lambda x: x["datetime"])

		# Write to CSV
		with output_file.open("w", newline="") as csvfile:
			csv_writer = csv.writer(csvfile)
			csv_writer.writerow(["Date", "Value"])

			for entry in sorted_values:
				date = entry["datetime"]
				value = float(entry.get("close", 0.0))  # Default to 0.0 if "close" is missing
				csv_writer.writerow([date, value])

		print(f"CSV file created successfully at {output_file}")

	except Exception as e:
		print(f"An error occurred: {e}")
		
if __name__ == "__main__":
	# Set up command-line argument parsing
	parser = argparse.ArgumentParser(description="Convert a JSON data file saved from twelvedata.com to a CSV")
	parser.add_argument(
		"--symbol",
		type=str,
		help="Which file to convert to generate",
	)

	args = parser.parse_args()
	
	# Call main with parsed arguments
	main(symbol=args.symbol)
