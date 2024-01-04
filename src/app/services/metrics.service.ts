import { Injectable } from '@angular/core';
import metricsJsonTest from 'src/assets/test/metrics-data-test.json'
import { MetricsData } from '../metrics-data-json-interface';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  // Implement JSON Type compatibility when getting from API.
  private metricsData: MetricsData = metricsJsonTest;

  constructor() { }

  getJsonData(): MetricsData {
    return this.metricsData;
  }
}
