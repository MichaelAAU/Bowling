import { Component, ChangeDetectorRef } from '@angular/core';
import { GetResponse } from '../data-models/get-response.model';
import { PostRequest } from '../data-models/post-request.model';
import { PostResponse } from '../data-models/post-response.model';
import { ScoreDisplay } from '../data-models/score-display.model';
import { BowlingService } from '../calulator-service/bowling.service';

@Component({
  selector: 'app-calculator',
  templateUrl: './game-calculator.component.html',
  styleUrls: ['./game-calculator.component.css']
})

export class CalculatorComponent {

  constructor(public bowlingService: BowlingService, private changeDetectorRefs: ChangeDetectorRef) {}

  getRequestDone: boolean = false;

  getResponseText: string = "";
  getResponseDone: boolean = false;

  postRequest: PostRequest = {"token":"", "points":[]};
  postRequestDone: boolean = false;

  postResponseText: string = "";
  postResponseDone: boolean = false;

  data: ScoreDisplay[] = [];
  columnsToDisplay = ['frames', 'pins1', 'pins2', 'scores'];

  calculateGame() {
    this.getResponseText= ""; this.postResponseText=""; this.data = [];
    this.postRequestDone = false; this.getRequestDone = true;
    this.bowlingService.getRequest().then((getResult: GetResponse)=>{
      this.getResponseText = JSON.stringify(getResult);

      this.postRequest.points = this.bowlingService.scoreCalculation(getResult.points);
      this.data = this.bowlingService.tableCalculation(getResult.points, this.postRequest.points);
      this.changeDetectorRefs.detectChanges();

      this.postRequest.token = getResult.token;
      this.postRequestDone = true;
      this.bowlingService.postRequest(this.postRequest).then((postResult: PostResponse)=>{
        this.postResponseText = JSON.stringify(postResult);
      });
    });
  }
}
