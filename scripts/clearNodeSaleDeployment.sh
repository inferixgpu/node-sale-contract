#!/bin/bash

# Check if deploymentId is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <deploymentId>"
  exit 1
fi

# Set deploymentId
deploymentId=$1

# Function to run the command for a given tier and whitelisted status
run_command() {
  local tier=$1
  local isWhitelisted=$2

  futureId="InferixNodeSale#deploy_InferixNodeSale_${tier}_${isWhitelisted}"
  echo "Running: npx hardhat ignition wipe chain-${deploymentId} ${futureId}"
  npx hardhat ignition wipe "chain-${deploymentId}" "${futureId}"
}

# Loop for whitelisted tiers (1-8)
for tier in {1..8}; do
  run_command $tier true
done

# Loop for non-whitelisted tiers (1-20)
for tier in {1..20}; do
  run_command $tier false
done
