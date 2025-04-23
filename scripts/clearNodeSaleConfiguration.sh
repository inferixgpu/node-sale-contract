#!/bin/bash

# Check if deploymentId is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <deploymentId>"
  exit 1
fi

# Set deploymentId
deploymentId=$1

# List of fixed futureIds
fixedFutureIds=(
  "InferixNodeSaleConfiguration#InferixNodeSaleConfiguration.setSaleConfig"
  "InferixNodeSaleConfiguration#InferixNodeSaleConfiguration"
)

# Function to run the command for a given tier and whitelisted status
run_command() {
  local tier=$1
  local isWhitelisted=$2

  futureId="InferixNodeSaleConfiguration#setTierConfig_${tier}_${isWhitelisted}"
  echo "Running: npx hardhat ignition wipe chain-${deploymentId} ${futureId}"
  npx hardhat ignition wipe "chain-${deploymentId}" "${futureId}"
}

# Run commands for dynamically generated futureIds with tier and isWhitelisted combinations

# Loop for tiers 1-9 with both true and false whitelisting
for tier in {1..8}; do
  run_command $tier true
done

# Run the remaining specific tiers with false whitelisting (since 10-19 are already handled)
for tier in {1..20}; do
  run_command $tier false
done

# Run commands for fixed futureIds
for futureId in "${fixedFutureIds[@]}"; do
  echo "Running: npx hardhat ignition wipe chain-${deploymentId} ${futureId}"
  npx hardhat ignition wipe "chain-${deploymentId}" "${futureId}"
done