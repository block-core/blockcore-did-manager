import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { invoke } from '@tauri-apps/api/tauri';
import {
  DID,
  generateKeyPair,
  sign,
  verify,
  anchor,
} from '@decentralized-identity/ion-tools';

import { save } from '@tauri-apps/api/dialog';

import { writeTextFile, BaseDirectory, FileEntry } from '@tauri-apps/api/fs';
import { writeFile } from '@tauri-apps/api/fs';

// @ts-ignore
import { dialog, fs } from '@tauri-apps/api';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DidIonMethod, DidDhtMethod } from '@web5/dids';
import { Web5 } from '@web5/api';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreate } from './dialog-create.component';
import { DialogCredential } from './dialog-credential.component';
import { VerifiableCredential, PresentationExchange } from '@web5/credentials';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  greetingMessage = '';

  constructor(public dialog: MatDialog) {}

  async createDialog() {
    const dialogRef = this.dialog.open(DialogCreate);

    dialogRef.afterClosed().subscribe(async (result) => {
      console.log(result);

      if (result) {
        let services: any = [
          {
            id: '#dwn',
            type: 'DecentralizedWebNode',
            serviceEndpoint: {
              messageAuthorizationKeys: ['#dwn-sig'],
              nodes: ['https://dwn.liberstad.com'],
              recordEncryptionKeys: ['#dwn-sig'],
            },
          },
        ];

        // Temporarily just make it null.
        services = undefined;

        await this.generateIdentity(result.name, result.tags, services);
        this.readFiles(this.directory!);
      }
    });
  }

  copyPortable(identity: any) {
    const portable = JSON.stringify(identity.did);
    navigator.clipboard.writeText(portable);
  }

  async createCredentialDialog(identity: any) {
    const dialogRef = this.dialog.open(DialogCredential);

    dialogRef.afterClosed().subscribe(async (result) => {
      console.log(result);

      if (result) {
        console.log(identity);
        console.log(result);

        const tags = result.tags;

        let vcPayload: any = {};

        if (result.schema === 'IdentityCredential') {
          vcPayload = {
            type: 'IdentityCredential',
            issuer: identity.id,
            subject: result.did,
            data: {
              name: result.name,
              birthDate: result.birthDate,
            },
          };
        } else if (
          result.schema === 'WorldVoluntaryistOrganisationCredential'
        ) {
          vcPayload = {
            type: 'WorldVoluntaryistOrganisation',
            issuer: identity.id,
            subject: result.did,
            data: {
              signed: 'The Voluntaryist Covenant',
              version: '1.0',
            },
          };
        }

        const vc = await VerifiableCredential.create(vcPayload);

        const signedVcJwt = await vc.sign({ did: identity.did });

        const vcDoc = VerifiableCredential.parseJwt({ vcJwt: signedVcJwt });
        console.log(vcDoc);

        const vcJson = {
          issuer: identity.id,
          tags: tags.split(',').map((item: string) => item.trim()),
          jwt: signedVcJwt,
          vc: vcDoc.vcDataModel
        };

        await this.saveCredential(vc.vcDataModel.id!, vcJson);

        // let services: any = [
        //   {
        //     id: '#dwn',
        //     type: 'DecentralizedWebNode',
        //     serviceEndpoint: {
        //       messageAuthorizationKeys: ['#dwn-sig'],
        //       nodes: ['https://dwn.liberstad.com'],
        //       recordEncryptionKeys: ['#dwn-sig'],
        //     },
        //   },
        // ];

        // // Temporarily just make it null.
        // services = undefined;

        // await this.generateIdentity(result.name, result.tags, services);
        // this.readFiles(this.directory!);
      }
    });
  }

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke<string>('greet', { name }).then((text) => {
      this.greetingMessage = text;
    });
  }

  directory?: string | string[] | null;
  identities: any[] = [];
  files: FileEntry[] = [];

  chooseDirectory() {
    dialog
      .open({ directory: true })
      .then((directory) => {
        // directory is the path of the selected directory
        console.log(directory);
        this.directory = directory;
        this.readFiles(this.directory);
      })
      .catch((error) => {
        // handle error
        console.error(error);
      });
  }

  async publish(identity: any) {
    console.log('PUBLISH', identity);
    // const anchorOptions = { keySet: identity.keys, services: identity.did.document.service };
    console.log(identity);

    const publishOptions = {
      didDocument: identity.did.document,
      identityKey: identity.did.keySet.verificationMethodKeys[0],
    };

    console.log(publishOptions);

    try {
      // If the publish flag is set, publish the DID Document to the DHT.
      // await this.publish({ identityKey, didDocument: document });
      const publishResult = await DidDhtMethod.publish(publishOptions);
      console.log(publishResult);
      identity.anchor = publishResult;
      identity.published = true;
      await this.saveIdentity(identity);
    } catch (err) {
      console.log(err);
    }
  }

  readFiles(directory: string | string[] | null) {
    this.identities = [];

    if (typeof directory === 'string') {
      fs.readDir(directory)
        .then((files) => {
          this.files = files.filter((file) =>
            file.path.endsWith('.identity.json')
          );

          this.files.forEach((file) => {
            fs.readTextFile(file.path)
              .then((text) => {
                // text is the content of the file
                let json = JSON.parse(text);
                this.identities.push(json);
              })
              .catch((error) => {
                // handle error
                console.error(error);
              });
          });
        })
        .catch((error) => {
          // handle error
          console.error(error);
        });
    }
  }

  pretty(json: any) {
    return JSON.stringify(json, null, 2);
  }

  async writeJsonToFile(path: string, data: any) {
    try {
      // Convert the data to a JSON string
      const jsonString = JSON.stringify(data, null, 2);

      // Write the JSON string to the file
      await writeFile({ path, contents: jsonString });

      console.log('JSON file has been written successfully');
    } catch (error) {
      console.error('Error writing JSON file:', error);
    }
  }

  async writeTextToFile(path: string, data: string) {
    try {
      // Write the JSON string to the file
      await writeFile({ path, contents: data });

      console.log('File has been written successfully');
    } catch (error) {
      console.error('Error writing file:', error);
    }
  }

  async saveCredential(id: string, credential: any) {
    const path = this.getFilePath(id, 'credential');
    this.writeJsonToFile(path, credential);
  }

  async saveIdentity(identity: any) {
    const path = this.getFilePath(identity.id, 'identity');
    this.writeJsonToFile(path, identity);
  }

  getSafeIdentity(id: string) {
    return id.replace('did:dht:', '').replace('urn:uuid:', '');
  }

  getFilePath(id: string, type: string) {
    return `${this.directory}\\${this.getSafeIdentity(id)}.${type}.json`;
  }

  async generateIdentity(name: string, tags: string, services: any[]) {
    //Creates a DID using the DHT method and publishes the DID Document to the DHT
    const didDht = await DidDhtMethod.create({
      publish: false,
      services: services,
    });

    console.log(didDht);

    //DID and its associated data which can be exported and used in different contexts/apps
    const portableDID = JSON.stringify(didDht);

    //DID string
    const did = didDht.did;

    //DID Document
    const didDocument = JSON.stringify(didDht.document);

    //Cryptographic keys associated with DID
    const keys = JSON.stringify(didDht.keySet);

    //Primary form of a DID. more info: https://www.w3.org/TR/did-core/#dfn-canonicalid
    const canonicalId = did; //didDht.canonicalId;

    // const myIonDid = await DidIonMethod.create({ services: services });

    const path = this.getFilePath(canonicalId!, 'identity');
    // const path = this.directory + '\\' + this.getSafeIdentity(myIonDid.canonicalId!) + '.identity.json';
    // const data = { key: 'value' }; // replace with your actual data

    const document = {
      name: name,
      tags: tags.split(',').map((item: string) => item.trim()),
      id: canonicalId,
      did: didDht,
      published: false,
      // document: didDht.document,
      // keys: didDht.keySet,
    };

    await this.writeJsonToFile(path, document);
  }

  async generate() {
    const myIonDid = await DidIonMethod.create({
      services: [
        {
          id: 'domain-1',
          type: 'LinkedDomains',
          serviceEndpoint: 'https://foo.example.com',
        },
      ],
    });
    console.log(myIonDid);

    const path =
      this.directory +
      '\\' +
      myIonDid.canonicalId!.substring(8) +
      '.identity.json'; // remove did:dht:
    // const data = { key: 'value' }; // replace with your actual data

    const document = {
      name: 'Sondre',
      tags: ['liberstad resident', 'liberstad membership organisation'],
      id: myIonDid.canonicalId,
      did: myIonDid,
    };

    this.writeJsonToFile(path, document);

    // const web5 = new Web5.connect({  });

    // const myDid = await Web5.did.create("ion");
    // console.log(myDid);
    return;

    let authnKeys = await generateKeyPair();
    let did = new DID({
      content: {
        publicKeys: [
          {
            id: 'key-1',
            type: 'EcdsaSecp256k1VerificationKey2019',
            publicKeyJwk: authnKeys.publicJwk,
            purposes: ['authentication'],
          },
        ],
        services: [
          {
            id: 'domain-1',
            type: 'LinkedDomains',
            serviceEndpoint: 'https://foo.example.com',
          },
        ],
      },
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
      payload: payload,
    });

    let valid = await verify({
      publicJwk: key,
      jws: jws,
    });

    console.log('SECP256K1 JWS verification successful:', valid);
    console.log(jws);

    // Store the key material and source data of all operations that have been created for the DID
    let ionOps = await did.getAllOperations();

    const result = await dialog.open({ directory: true });

    const content = JSON.stringify({ ops: ionOps });

    const options = {
      path: result + '/ion-did-ops-v1.json',
      contents: content,
    };
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
