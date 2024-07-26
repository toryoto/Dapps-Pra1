import React from "react";
import Link from "next/link";
import { EchoDetailsProps } from "../types/type"

export const EchoDetails: React.FC<EchoDetailsProps> = ({ title, value, linkTo }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
    {/* addressだけlinkToパラメータを保持している */}
    {linkTo ? (
      <Link href={linkTo} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        {value}
      </Link>
    ) : (
      <p className="text-sm text-gray-900 dark:text-gray-100">{value}</p>
    )}
  </div>
);