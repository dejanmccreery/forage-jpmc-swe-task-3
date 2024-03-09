import { ServerRespond } from './DataStreamer';

export interface Row {
  timestamp: Date,
  price_abc: number,
  price_def: number,
  ratio: number,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}


export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    const pxABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const pxDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
    const pxRatio = pxABC / pxDEF;
    const upperBound = 1 + 0.1;
    const lowerBound = 1 - 0.1;
    return {
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ? 
        serverRespond[0].timestamp : serverRespond[1].timestamp,
      price_abc: pxABC,
      price_def: pxDEF,
      ratio: pxRatio,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (pxRatio > upperBound || pxRatio < lowerBound) ? pxRatio : undefined
    };
  }
}

function calculate12MonthAverageRatio(data: ServerRespond[]): number {
  // Assuming data is an array of ServerRespond objects with timestamps
  // Sort the data by timestamp in ascending order
  const sortedData_ABC = data[0].sort((a, b) => a.timestamp - b.timestamp);
  const sortedData_DEF = data[1].sort((a, b) => a.timestamp - b.timestamp);

  // Calculate the timestamp for 12 months ago
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  // Filter the data for the past 12 months
  const past12MonthsData_ABC = sortedData_ABC.filter(item => new Date(item.timestamp) >= twelveMonthsAgo);
  const past12MonthsData_DEF = sortedData_DEF.filter(item => new Date(item.timestamp) >= twelveMonthsAgo);

  // Calculate the price moving average for the past 12 months
  const ma12Months = past12MonthsData.reduce((sum, item) => 
    sum + (item.top_ask.price + item.top_bid.price) / 2, 0
  ) / past12MonthsData.length;

  return averageRatio;
}

function calculate12MonthStandardDeviationRatio(data: ServerRespond[]): { average: number, upperBand: number, lowerBand: number } {
  const average = calculate12MonthAverageRatio(data);
  
  // Calculate the array of ratio values for the past 12 months
  const ratioValues = data.slice(-12).map(item => (item.top_ask.price + item.top_bid.price) / 2);

  // Calculate the standard deviation
  const variance = ratioValues.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / ratioValues.length;
  const standardDeviation = Math.sqrt(variance);

  // Calculate the upper and lower bands
  const upperBand = average + standardDeviation;
  const lowerBand = average - standardDeviation;

  return {
    average: average,
    upperBand: upperBand,
    lowerBand: lowerBand
  };
}

