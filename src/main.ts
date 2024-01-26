// import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// For some reason, this doesn't work with the webpack? Wonder why...
// global.Buffer = global.Buffer || require('buffer').Buffer;

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));


// platformBrowserDynamic()
// .bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));
