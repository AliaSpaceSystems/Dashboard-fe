export interface MetricsData {
  users: Array<
    {type: string, value: number}
  >,
  models: Array<
    {type: string, value: number}
  >,
  datasets: {
    totalNumber: number
  },
  services: Array<
    {
      name: string,
      label: string,
      type: string,
      activeUsersTrend: {
        federatedUsers: {
          lastMonth: {
            trend: number,
            values: Array<
              {
                date: string,
                value: number
              }
            >
          },
          lastThreeMonths: {
            trend: number,
            values: Array<
              {
                date: string,
                value: number
              }
            >
          }
        },
        registeredUsers: {
          lastMonth: {
            trend: number,
            values: Array<
              {
                date: string,
                value: number
              }
            >
          },
          lastThreeMonths: {
            trend: number,
            values: Array<
              {
                date: string,
                value: number
              }
            >
          }
        }
      },
      activeUsersPerState: {
        values: Array<
          {
            stateName: string,
            value: number,
            trend: number
          }
        >
      },
      serviceMetrics: Array<
        {
          name: string,
          granularity: Array<string>,
          totalValue: number,
          values?: Array<
            {
              date: string,
              value: number
            }
          >
        }
      >
    }
  >,
  dataProviders: Array<
    {
      name: string,
      label: string,
      accessedProductsTotalVolume: number,
      datasets: Array<
        {
          name: string,
          label: string,
          accessedProducts: {
            lastMonth: Array<
              {
                date: string,
                numberValue: number,
                volumeValue: number
              }
            >,
            lastThreeMonths: Array<
              {
                date: string,
                numberValue: number,
                volumeValue: number
              }
            >
          },
          publishedProducts: {
            lastMonth: Array<
              {
                date: string,
                numberValue: number,
                volumeValue: number
              }
            >,
            lastThreeMonths: Array<
              {
                date: string,
                numberValue: number,
                volumeValue: number
              }
            >
          },
          accessedDataPerUserCategory: {
            lastMonth: {
              federatedUsers: number,
              registeredUsers: number
            },
            lastThreeMonths: {
              federatedUsers: number,
              registeredUsers: number
            }
          },
          accessedDataPerDatasetCategory: {
            lastMonth: {
              reAnalysis: number,
              forecast: number,
              satellite: number
            },
            lastThreeMonths: {
              reAnalysis: number,
              forecast: number,
              satellite: number
            }
          }
        }
      >
    }
  >
}
