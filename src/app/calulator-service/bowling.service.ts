import { Injectable } from '@angular/core';
import { GetResponse } from '../data-models/get-response.model';
import { PostResponse } from '../data-models/post-response.model';
import { PostRequest } from '../data-models/post-request.model';
import { ScoreDisplay } from '../data-models/score-display.model';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class BowlingService {

  private rollingFirstBall: number = 0;
  private rollingSecondBall: number = 1;
  private lastBallSpare: number = 2;
  private lastBallStrike: number = 3;
  private twoBallsAgoStrike: number = 4;
  private twoConsecutiveStrikes: number = 5;
  private scoresArray: number[];
  private totalScore: number;
  private rollingFrame: number;
  private state: number;
  private firstBallPins: number;

  constructor(private http: HttpClient) {}

  async getRequest() {
    let promise = new Promise((resolve)=>{
      this.http.get<GetResponse>('http://13.74.31.101/api/points')
      .subscribe((data)=>{
        resolve(data);
      });
    });
    return await promise;
  }

  async postRequest(data: PostRequest) {
    let promise = new Promise((resolve)=>{
      this.http.post<PostResponse>('http://13.74.31.101/api/points', data)
      .subscribe((responseData)=>{
        resolve(responseData);
      });
    });
    return await promise;
  }

  scoreCalculation(frames: [number, number][]) {
    this.totalScore = 0;
    this.rollingFrame = 1;
    this.scoresArray = [];
    this.state = this.rollingFirstBall;
    for(var index in frames) {
      this.calculate(frames[index][0], frames.length);
      if ((frames[index][0] != 10) || (index == "10")) { // if it's not a strike, or bonus pins
        this.calculate(frames[index][1], frames.length);
      }
    }
    return this.scoresArray;
  }

  private calculate(pins: number, totalFrames: number) {
    switch (this.state) {
      case this.rollingFirstBall: {
        switch (pins) {
          case 10: { // a strike
            this.rollingFrame++;
            this.state=this.lastBallStrike;
            if (this.rollingFrame > totalFrames) { // if points end on a strike
              this.addScore(10); // = no bonus, only 10
            } break;
          }
          default: {
            this.firstBallPins = pins;
            this.state = this.rollingSecondBall;
            break;
          }
        } break;
      }
      case this.rollingSecondBall: {
        switch (this.firstBallPins + pins) {
          case 10: { // a spare
            this.rollingFrame++;
            this.state = this.lastBallSpare;
            if (this.rollingFrame > totalFrames) { // if points end on a spare
              this.addScore(10); // = no bonus, only 10
            } break;
          }
          default: {
            this.rollingFrame++;
            if (this.rollingFrame < 12) { // if it's before normal game end
              this.addScore(this.firstBallPins + pins); // normal points
              this.state = this.rollingFirstBall;
            } break;
          }
        } break;
      }
      case this.lastBallSpare: {
        this.addScore(10 + pins); // add spare bonus points
        switch (pins) {
          case 10: { // strike
            this.rollingFrame++;
            this.state = this.lastBallStrike;
            if (this.rollingFrame > totalFrames && this.rollingFrame < 12) { // if points end on a strike, before normal game end
              this.addScore(10); // = no bonus, only 10
            } break;
          }
          default: {
            this.firstBallPins = pins;
            this.state = this.rollingSecondBall;
            break;
          }
        } break;
      }
      case this.lastBallStrike: {
        switch (pins) {
          case 10: { // a strike
            this.rollingFrame++;
            this.state = this.twoConsecutiveStrikes;
            if (this.rollingFrame > totalFrames && this.rollingFrame < 12) { // if points end on a strike, b4 normal game end
              this.addScore(20); // = no bonus, only 20
              this.addScore(10); // = no bonus, only 10
            } break;
          }
          default: {
            this.firstBallPins = pins;
            this.state = this.twoBallsAgoStrike;
            break;
          }
        } break;
      }
      case this.twoBallsAgoStrike: {
        this.addScore(10 + this.firstBallPins + pins); // add strike bonus points
        switch (this.firstBallPins + pins) {
          case (10): { // spare
            this.rollingFrame++;
            this.state = this.lastBallSpare;
            if (this.rollingFrame > totalFrames && this.rollingFrame < 12) { //if points end on a spare, before normal game end
              this.addScore(10); // = no bonus, only 10
            } break;
          }
          default:  {
            this.rollingFrame++;
            if (this.rollingFrame < 12) { // if it's before normal game end
              this.addScore(this.firstBallPins + pins); // normal points
              this.state = this.rollingFirstBall;
            } break;
          }
        } break;
      }
      case this.twoConsecutiveStrikes: {
        this.addScore(10 + 10 + pins); // add strike bonus points
        switch (pins) {
          case 10: { // a strike
            this.rollingFrame++;
            if (this.rollingFrame > totalFrames && this.rollingFrame < 12) { // if points end on a strike, b4 normal game end
              this.addScore(20); // = no bonus, only 20
              this.addScore(10); // = no bonus, only 10
            } break;
          }
          default: {
            this.firstBallPins = pins;
            this.state = this.twoBallsAgoStrike;
            break;
          }
        } break;
      }
      default:
        console.log("Invalid State: " + this.state);
        break;
    }
    return this.scoresArray;
  }

  private addScore(score: number) {
    this.totalScore += score;
    const newScore: number = this.totalScore;
    this.scoresArray.push(newScore);
  }

  tableCalculation(frames: [number, number][], scores: number[]) {
    let data: ScoreDisplay[] = [];
    for(var index in frames) {
      const dataElement: ScoreDisplay = {roll1: 0, roll2: 0, score: 0};
      dataElement.roll1 = frames[index][0];
      dataElement.roll2 = frames[index][1];
      if (+index <= scores.length) {
        dataElement.score = scores[index];
      } else {
        dataElement.score = null;
      }
      data.push(dataElement);
    }
    return data;
  }
}
