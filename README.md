# Notice
This sample is more to illustrate the steps needed to securely identify a webhook delivered by Dolby.io. You will need to either publicly host this sample yourself, or open the necessary ports on your developer machine to fully receive webhooks. An https certificate is not necessary.

## Steps
1. Create a webhook within dashboard or API. The webhook url should be the expected path you are hosting this sample on.
2. Clone repo
3. Edit default.json5 and enter the webhook secret in the `webhookSecret` field. You only receive this after creating a webhook.
4. Install packages via: `npm install`
5. Run application: `node index.js`

If `thumbnailDir` is unspecified, this will default to a subdirectory within the platform's TMPDIR. So it is not strictly required to define, but added as simple config property.

Once a webhook is received you should see the equivalent of the following printed to stdout (for a stream started event)
```
DeliveredOn: 2023-03-28T03:25:30.452Z. Event: {
  type: 'feeds',
  event: 'started',
  timestamp: 1679973930415,
  data: {
    feedId: 'c4980bc0-5695-48a1-8918-f330724c37f1',
    accountId: 'ZG6NWV',
    name: 'teststream',
    streamId: 'ZG6NWV/teststream',
    started: 1679973930394,
    active: true
  }
}
```

For a thumbnail webhook you should see the equivalent of the following, along with a jpeg thumbnail being saved to `thumbnailDir`.
```
DeliveredOn: 2023-03-28T03:34:03.013Z. GeneratedOn: 2023-03-28T03:34:00.650Z. FeedId: c4980bc0-5695-48a1-8918-f330724c37f1. StreamId: ZG6NWV/teststream. ThumbnailSize: 1583
```

You should never see the following, as this would imply someone else (other than Dolby.io) is sending you this data. Which is not signed by our shared secret.
```
Invalid signature sent to us, unsafe data. HeaderSignature: 6184d6847d594ec75c4c07514d4bb490d5e166df. CalculatedSignature: sha1=184a736c0d8c80c617f735d38631022fbd1e721c. IsThumbnail: false}. Body: ...
```

# Language Agnostic Steps
Most of this sample is merely setting up a http webserver and consuming the request body in a typically nodejs fashion. The same can be applied to other languages and/or frameworks.

1. Decode the `webhookSecret` as a base64 encoded string. You should now have an array of bytes.
2. Calculate the HMAC SHA1 of the entire request body, using the webhook secret bytes (from step 1). In most frameworks the result of this will also be an array of bytes.
3. Convert the result of step 2 to a hex string.
4. Read the request header: `X-Millicast-Signature`
5. Compare your calculated signature (from step 3) to the signature from the request header (step 4).
6. If signatures match, you can now trust the request data as coming from Dolby.io. Decode the request body as JSON and operate on it as needed.
