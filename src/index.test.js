const { makeRequest, processOne, processMany } = require("./index");
const axios = require("axios");
const async = require("async");
const fs = require("fs");

jest.mock("axios");
jest.mock("async");
jest.mock("fs");

describe("snyk-exercise", () => {
  describe("makeRequest", () => {
    it("should return status code 200 for a successful request", async () => {
      axios.get.mockResolvedValue({ status: 200 });
      const status = await makeRequest("http://example.com");
      expect(status).toBe(200);
    });

    it("should return -1 for a request that fails without a response due to network problems", async () => {
      axios.get.mockRejectedValue({ request: {} });
      const status = await makeRequest("http://example.com");
      expect(status).toBe(-1);
    });

    it("should return the status code for a request that fails with a response", async () => {
      axios.get.mockRejectedValue({ response: { status: 404 } });
      const status = await makeRequest("http://example.com");
      expect(status).toBe(404);
    });
  });

  describe("processOne", () => {
    let results;

    beforeEach(() => {
      results = new Map();
    });

    it("should add a new domain to results if it doesn't exist", async () => {
      const task = {
        url: "http://example.com/test",
        domain: "example.com",
        endpoint: "/test",
      };
      axios.get.mockResolvedValue({ status: 200 });

      await processOne(task, results);

      expect(results.has("example.com")).toBe(true);
      expect(results.get("example.com").validPaths).toEqual(["/test"]);
      expect(results.get("example.com").statusCodes.get(200)).toBe(1);
    });

    it("should increment the status code count for existing domains", async () => {
      const results = new Map();

      // response: 200
      const task1 = {
        url: "http://example.com/test",
        domain: "example.com",
        endpoint: "/test",
      };
      axios.get.mockResolvedValueOnce({ status: 200 });

      // response: 404
      const task2 = {
        url: "http://example.com/notfound",
        domain: "example.com",
        endpoint: "/notfound",
      };
      axios.get.mockResolvedValueOnce({ status: 404 });

      await processOne(task1, results);
      await processOne(task2, results);

      const domainResults = results.get("example.com");

      expect(domainResults.statusCodes.get(200)).toBe(1);
      expect(domainResults.statusCodes.get(404)).toBe(1);

      // Should not add invalid paths to validPaths
      expect(domainResults.validPaths).toEqual(["/test"]);
    });
  });

  describe("processMany", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should process domains and endpoints correctly", async () => {
      fs.readFileSync.mockImplementation((path) => {
        if (path === "/path/to/domains.txt") {
          return "http://example.com\nhttp://test.com";
        } else if (path === "/path/to/endpoints.txt") {
          return "/endpoint1\n/endpoint2";
        }
        return "";
      });

      axios.get.mockImplementation((url) => {
        if (url === "http://example.com/endpoint1") {
          return Promise.resolve({ status: 200 });
        } else if (url === "http://example.com/endpoint2") {
          return Promise.resolve({ status: 404 });
        } else if (url === "http://test.com/endpoint1") {
          return Promise.resolve({ status: 200 });
        } else if (url === "http://test.com/endpoint2") {
          return Promise.reject({ response: { status: 500 } });
        }
        return Promise.reject(new Error("Unexpected URL"));
      });

      const mockQueue = {
        push: jest.fn(),
        drain: jest.fn((callback) => callback()),
      };
      async.queue.mockReturnValue(mockQueue);

      await processMany({
        domains: "/path/to/domains.txt",
        endpoints: "/path/to/endpoints.txt",
      });

      expect(fs.readFileSync).toHaveBeenCalledWith(
        "/path/to/domains.txt",
        "utf-8"
      );
      expect(fs.readFileSync).toHaveBeenCalledWith(
        "/path/to/endpoints.txt",
        "utf-8"
      );

      expect(mockQueue.push).toHaveBeenCalledTimes(4);

      expect(mockQueue.push).toHaveBeenCalledWith({
        url: "http://example.com/endpoint1",
        domain: "http://example.com",
        endpoint: "/endpoint1",
      });
      expect(mockQueue.push).toHaveBeenCalledWith({
        url: "http://example.com/endpoint2",
        domain: "http://example.com",
        endpoint: "/endpoint2",
      });
      expect(mockQueue.push).toHaveBeenCalledWith({
        url: "http://test.com/endpoint1",
        domain: "http://test.com",
        endpoint: "/endpoint1",
      });
      expect(mockQueue.push).toHaveBeenCalledWith({
        url: "http://test.com/endpoint2",
        domain: "http://test.com",
        endpoint: "/endpoint2",
      });

      expect(mockQueue.drain).toHaveBeenCalled();
    });
  });
});
