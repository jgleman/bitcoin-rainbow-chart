#!/bin/bash

# Ensure a symbol argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <symbol>"
  exit 1
fi

# Assign the symbol argument
symbol=$1

# Step 1: Change to the get-data directory and run the node script
cd get-data || { echo "Directory 'get-data' not found"; exit 1; }
node get-all-data.js "$symbol"
if [ $? -ne 0 ]; then
  echo "Error: 'node get-all-data.js' failed"
  cd ..
  exit 1
fi
cd ..


# Step 2: Activate the virtual environment
source myenv/bin/activate || { echo "Failed to activate virtual environment"; exit 1; }

# Step 3: Run the Python script
python ./src/json_to_csv.py --symbol "$symbol"

cd shortcuts

# Step 4: Create a new shell script file
new_script="${symbol}.sh"

cat <<EOF > "$new_script"
#!/bin/bash

# Activate the virtual environment
source myenv/bin/activate

# Run the Python command with arguments
python ./src/main.py --symbol --symbol $symbol --width 0.4 --offset 1.5
EOF

# Make the new script executable
chmod +x "$new_script"

echo "Script $new_script created and made executable."

cd ..
