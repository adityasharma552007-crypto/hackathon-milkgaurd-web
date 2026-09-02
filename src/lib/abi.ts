export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "scanId", type: "string" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "string", name: "status", type: "string" }
    ],
    name: "logScan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export default CONTRACT_ABI;
