import datetime
import time

import ccxt
import numpy as np
import pandas as pd
from dateutil.parser import parse
from scipy.optimize import curve_fit


def log_func(x, a, b, c):
    """Logarithmic function for curve fitting."""
    return a * np.log(b + x) + c
    


def get_data(file_path):
    """
    Load and preprocess data from a CSV file.

    Args:
        file_path (str): Path to the CSV file.

    Returns:
        pd.DataFrame: Processed data.
        np.ndarray: Fitted Y data.
    """
    raw_data = pd.read_csv(file_path)
    raw_data["Date"] = pd.to_datetime(raw_data["Date"])

    # Calculate the difference in days between the last date and today
    diff_days = (pd.Timestamp.today() - raw_data["Date"].max()).days

    raw_data = raw_data[raw_data["Value"] > 0]

    # Prepare data for curve fitting
    xdata = np.array([x + 1 for x in range(len(raw_data))])
    ydata = np.log(raw_data["Value"])

    # Fit the logarithmic curve
    popt, _ = curve_fit(log_func, xdata, ydata, maxfev=40000)

    return raw_data, popt


