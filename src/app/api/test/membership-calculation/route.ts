import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const currentYear = new Date().getFullYear(); // 2025
  
  // Test different membership creation dates
  const testCases = [
    {
      name: "Created today",
      createdAt: new Date().toISOString(),
    },
    {
      name: "Created January 2025",
      createdAt: new Date(2025, 0, 1).toISOString(),
    },
    {
      name: "Created December 2024", 
      createdAt: new Date(2024, 11, 31).toISOString(),
    },
    {
      name: "Created January 2023",
      createdAt: new Date(2023, 0, 1).toISOString(),
    }
  ];
  
  const results = testCases.map(testCase => {
    const membershipStartYear = new Date(testCase.createdAt).getFullYear();
    const yearsSinceStart = Math.max(1, currentYear - membershipStartYear + 1);
    const cumulativeLimit = 50 * yearsSinceStart; // PLUS example
    
    return {
      ...testCase,
      membershipStartYear,
      currentYear,
      yearsSinceStart,
      cumulativeLimit,
      calculation: `${currentYear} - ${membershipStartYear} + 1 = ${yearsSinceStart}`
    };
  });
  
  return NextResponse.json({
    currentYear,
    results
  });
}