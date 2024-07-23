import React from "react";
import { EchoDetailsProps } from "../types/type"

export const EchoDetails: React.FC<EchoDetailsProps> = ({ title, value }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
    <p className="text-sm text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);