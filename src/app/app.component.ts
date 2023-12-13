import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { invoke } from "@tauri-apps/api/tauri";
import { DID, generateKeyPair, sign, verify, anchor } from '@decentralized-identity/ion-tools';

import { save } from '@tauri-apps/api/dialog';

import { writeTextFile, BaseDirectory, FileEntry } from '@tauri-apps/api/fs';
import { dialog, fs } from '@tauri-apps/api';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  greetingMessage = "";

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke<string>("greet", { name }).then((text) => {
      this.greetingMessage = text;
    });
  }

  directory?: string | string[] | null;
  identities: any[] = [];
  files: FileEntry[] = [];

  chooseDirectory() {
    dialog.open({ directory: true }).then(directory => {
      // directory is the path of the selected directory
      console.log(directory);
      this.directory = directory;
      this.readFiles(directory);
    }).catch(error => {
      // handle error
      console.error(error);
    });
  }

  readFiles(directory: string | string[] | null) {
    if (typeof directory === 'string') {
      fs.readDir(directory).then(files => {
        // files is an array of file paths
        console.log(files);

        this.files = files.filter(file => file.path.endsWith('.identity.json'));

        this.files.forEach(file => {
          fs.readTextFile(file.path).then(text => {
            // text is the content of the file
            console.log(text);
            let json = JSON.parse(text);
            console.log(json);
            this.identities.push(json);
          }).catch(error => {
            // handle error
            console.error(error);
          });
        });

      }).catch(error => {
        // handle error
        console.error(error);
      });
    }
  }

  pretty(json: any) {
    return JSON.stringify(json, null, 2);;
  }

  async generate() {


    let authnKeys = await generateKeyPair();
    let did = new DID({
      content: {
        publicKeys: [
          {
            id: 'key-1',
            type: 'EcdsaSecp256k1VerificationKey2019',
            publicKeyJwk: authnKeys.publicJwk,
            purposes: ['authentication']
          }
        ],
        services: [
          {
            id: 'domain-1',
            type: 'LinkedDomains',
            serviceEndpoint: 'https://foo.example.com'
          }
        ]
      }
    });

    console.log(did);
    console.log(authnKeys);

    let longFormURI = await did.getURI();
    let shortFormURI = await did.getURI('short');

    console.log(longFormURI);
    console.log('');
    console.log(shortFormURI);

    let suffix = await did.getSuffix();
    console.log(suffix);

    let request = await did.generateRequest(0);
    console.log(this.pretty(request));


    let payload = '';
    let key = (await did.getOperation(0)).update.privateJwk;

    let jws = await sign({
      privateJwk: key,
      payload: payload
    });

    let valid = await verify({
      publicJwk: key,
      jws: jws
    });

    console.log('SECP256K1 JWS verification successful:', valid);
    console.log(jws);


    // Store the key material and source data of all operations that have been created for the DID
    let ionOps = await did.getAllOperations();

    const result = await dialog.open({ directory: true });

    const content = JSON.stringify({ ops: ionOps });

    const options = { path: result + '/ion-did-ops-v1.json', contents: content };
    await fs.writeFile(options);

    // const filePath = await save({
    //   filters: [{
    //     name: 'Identity',
    //     extensions: ['json']
    //   }]
    // });

    // // Write a text file to the `$APPCONFIG/app.conf` path
    // await writeTextFile('ion-did-ops-v1.json',), { dir: BaseDirectory.AppConfig });

    // await writeFile('./ion-did-ops-v1.json', JSON.stringify({ ops: ionOps }));

    // await anchor(request);

  }
}
