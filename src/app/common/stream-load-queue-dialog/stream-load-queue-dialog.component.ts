import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WebSocketService } from '../../services/websocket.service';
import { AdminBulkDataService } from '../../services/admin.bulk-data.service';

//import { AdminStreamConnProperties } from '../../services/admin.bulk-data.service';
import { AdminStreamConnProperties, AdminStreamAnalysisConfig, AdminStreamLoadConfig, AdminStreamUploadRates } from '@senzing/sdk-components-ng';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'stream-load-queue-dialog',
    templateUrl: 'stream-load-queue-dialog.component.html',
    styleUrls: ['stream-load-queue-dialog.component.scss']
  })
  export class AdminStreamLoadQueueDialogComponent implements OnInit, OnDestroy, AfterViewInit {
    /** subscription to notify subscribers to unbind */
    public unsubscribe$ = new Subject<void>();
    public testStatus = "";
    public isTesting  = false;

    constructor(
      public dialogRef: MatDialogRef<AdminStreamLoadQueueDialogComponent>,
      private webSocketService: WebSocketService,
      private adminBulkDataService: AdminBulkDataService,
      @Inject(MAT_DIALOG_DATA) public data: {
        streamConnectionProperties: AdminStreamConnProperties,
        streamAnalysisConfig: AdminStreamAnalysisConfig,
        streamLoadConfig: AdminStreamLoadConfig
      }) {
      console.info('AdminStreamLoadQueueDialogComponent()', this.data);
    }
    /**
     * listen for websocket service errors
     */
    ngOnInit() {
      
    }

    ngAfterViewInit() {}

    /**
     * unsubscribe event streams
     */
    ngOnDestroy() {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  }