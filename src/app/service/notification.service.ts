import { Injectable } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class NotificationService {

    private readonly options: Partial<IndividualConfig> = {
        positionClass: 'toast-top-left',
        progressBar: false,
        disableTimeOut: false
      };

    constructor(private toast: ToastrService) {}

    onSuccess(message: string): void {
      this.toast.success(message, Title.SUCCESS, this.options);
    }
  
    onInfo(message: string): void {
      this.toast.info(message, Title.INFO, this.options);
    }
  
    onWarning(message: string): void {
      this.toast.warning(message, Title.WARNING, this.options);
    }
  
    onError(message: string): void {
      this.toast.error(message, Title.ERROR, this.options);
    }
  
  }
  
  enum Title { INFO = 'Info', SUCCESS = 'Success', WARNING = 'Warning', ERROR = 'Error'}
  