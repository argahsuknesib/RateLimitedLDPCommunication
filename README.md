## Rate Limited LDP Communication

The repository contains a single class for rate limiting LDP communication to handle the issue of socket hangup in Solid Pod Server when doing multiple requests that the server cannot handle.

## Usage

```ts
const communication = new RateLimitedLDPCommunication(5, 1000);
const response = await communication.get('https://pod.example.org/resource');
```

## License

This code is copyrighted by [Ghent University - imec](https://www.ugent.be/ea/idlab/en) and 
released under the [MIT Licence](./LICENCE)

## Contact

For any questions, please contact [Kush](mailto:kushagrasingh.bisen@ugent.be).