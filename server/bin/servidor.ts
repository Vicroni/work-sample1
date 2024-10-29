#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServidorStack } from '../lib/servidor-stack';

const app = new cdk.App();
new ServidorStack(app, 'ServidorStack', {
  env: { account: 'account-id', region: 'us-east-1' }
});