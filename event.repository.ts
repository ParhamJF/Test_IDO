/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {inject, injectable} from 'inversify';

import {TYPE} from '../../constant';
import {APIQuery, Event, MongoPagedResult} from '../../model';
import {DBClient} from '../client';
import {BaseRepository} from './base.repository';

@injectable()
export class EventRepository extends BaseRepository<Event> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'events');

    // TODO: Needs to be optimized, too slow
    // client.events.on('dbConnected', () => {
    //   client.db.createCollection('eventsView', {
    //     viewOn: 'events',
    //     pipeline: [
    //       {
    //         $project: {
    //           _id: 0,
    //           assets: '$$ROOT',
    //         },
    //       },
    //       {
    //         $lookup: {
    //           localField: 'events.content.idData.createdBy',
    //           from: 'accounts',
    //           foreignField: 'address',
    //           as: 'accounts',
    //         },
    //       },
    //       {
    //         $unwind: {
    //           path: '$accounts',
    //           preserveNullAndEmptyArrays: true,
    //         },
    //       },
    //       {
    //         $project: {
    //           _id: '$events._id',
    //           content: '$events.content',
    //           assetId: '$events.eventId',
    //           metadata: '$events.metadata',
    //           repository: '$events.repository',
    //           organization: '$accounts.organization',
    //         },
    //       },
    //       {
    //         $sort: {
    //           'events.content.idData.timestamp': -1,
    //         },
    //       },
    //     ],
    //   });
    // });
  }

  get timestampField(): string {
    return 'content.idData.timestamp';
  }

  get paginatedField(): string {
    return 'content.idData.timestamp';
  }

  get paginatedAscending(): boolean {
    return false;
  }

  public queryEvent(apiQuery: APIQuery, accessLevel: number): Promise<Event> {
    apiQuery.query = {
      ...apiQuery.query,
      ...{
        'content.idData.accessLevel': { $lte: accessLevel },
      },
    };
    apiQuery.fields = {
      repository: 0,
    };
    return this.findOne(apiQuery);
  }

  public queryEvents(
    apiQuery: APIQuery,
    accessLevel: number
  ): Promise<MongoPagedResult> {
    apiQuery.query = {
      ...apiQuery.query,
      ...{
        'content.idData.accessLevel': { $lte: accessLevel },
      },
    };
    apiQuery.fields = {
      repository: 0,
    };
    return this.findWithPagination(apiQuery);
  }

  public async queryUserEvents(apiQuery: APIQuery, accessLevel: number): Promise<any> {
    const pipeline = [
      {
        $match: {
          ...apiQuery.query,
          ...{
            'content.idData.accessLevel': { $lte: accessLevel },
          },
        },
      },
      {
        $project: {
          _id: 0,
          eventId: '$eventId',
          'content.data': '$content.data',
        },
      },
    ];

    apiQuery.query = pipeline;
    apiQuery.fields = {
      repository: 0,
    };
    return this.aggregatePaging(apiQuery);
  }

  public async findAssetTypes(apiQuery: APIQuery): Promise<any> {
    apiQuery.query = [
      {
        $match: apiQuery.query,
      },
      {
        $group: {
          _id: '$content.data.assetType',
        },
      },
    ];
    apiQuery.fields = {
      repository: 0,
    };
    return await super.aggregatePaging(apiQuery);
  }

  public async queryEventsCount(apiQuery: APIQuery): Promise<any> {
    apiQuery.fields = {
      repository: 0,
    };
    return this.count(apiQuery);
  }

  public searchEvents(
    apiQuery: APIQuery,
    accessLevel: number
  ): Promise<MongoPagedResult> {
    apiQuery.query = {
      ...apiQuery.query,
      ...{
        'content.idData.accessLevel': { $lte: accessLevel },
      },
    };
    apiQuery.fields = {
      eventId: 1,
      'content.idData': 1,
      'content.data': 1,
      'content.metadata': 1,
    };
    return this.search(apiQuery);
  }

  public async findEvents(apiQuery: APIQuery): Promise<any> {
    apiQuery.query = [
      {
        $lookup: {
          localField: 'content.idData.assetId',
          from: 'events',
          foreignField: 'content.idData.assetId',
          as: 'events',
        }
      },
      {
        $match: apiQuery.query,
      },
      {
        $project: {
          asset: '$$ROOT',
          refID: '$content.data.identifiers.referenceID',
        },
      },
    ];
    return await super.aggregate(apiQuery);
  }

  public async findEventChain(apiQuery: APIQuery, forward: boolean): Promise<any> {
    const results = await this.findEvents(apiQuery);
    if (results && results.length === 0) {
      return [];
    }

    // Different map for forward and backwards as their working is different
    const assetMapSet = new Map();
    const assetMapSetForBackward = new Map();
    let refAssets = [];

    if (forward) {
      // Returns result and updated map
      const {refChildAssets} = await this.getForwardReferenceAssets(results[0].asset.content.idData.assetId, apiQuery, assetMapSet);
      refAssets = refChildAssets;
      results[0].asset.forwardReferenceAssets = refAssets;
    }

    // Returns result and updated map
    const refIDs = results[0].refID.length > 0 ? results[0].refID[0].map(ref => (ref.assetId ? ref.assetId : ref)) : [];
    const {refChildAssets} = await this.getBackwardReferenceAssets(refIDs, apiQuery, assetMapSetForBackward);
    refAssets = refChildAssets;
    results[0].asset.backwardReferenceAssets = refAssets;

    return [results[0].asset];
  }

  private async getForwardReferenceAssets(assetId, apiQuery: APIQuery, assetMapSet) {
    const refAssets = [];
    let updatedMap = assetMapSet;
    if (assetId) {
      // If response exists in map than return it and do nothing else compute
      if (updatedMap.has(assetId)) {
        return {refChildAssets: updatedMap.get(assetId), updatedMap1 : updatedMap};
      } else {
        apiQuery.query = {
          $or: [
            {
              'content.data.identifiers.referenceID': {
                $eq: assetId,
              }
            },
            {
              'content.data.identifiers.referenceID.assetId': {
                $eq: assetId,
              }
            }
          ]
        };
        const refAsset = await this.findEvents(apiQuery);
        if (refAsset && refAsset.length > 0) {
          for (let i = 0; i < refAsset.length; i++) {
            const { refChildAssets, updatedMap1 } = await this.getForwardReferenceAssets(refAsset[i].asset.content.idData.assetId, apiQuery, updatedMap );
            updatedMap = updatedMap1;
            refAsset[i].asset.forwardReferenceAssets = refChildAssets;
            refAssets.push(refAsset[i].asset);
          }
        }
        updatedMap.set(assetId, refAssets);
      }
    }
    return {refChildAssets: refAssets, updatedMap1 : updatedMap};
  }

  private async getBackwardReferenceAssets(refID, apiQuery: APIQuery, assetMapSet) {
    const refAssets = [];
    let updatedMap = assetMapSet;

    if (refID && refID.length > 0) {
      for (let i = 0; i < refID.length; i++) {
        apiQuery.query = {
          'content.idData.assetId': {
            $eq: refID[i],
          },
        };
        let refAsset;
        // In backwards we check for each element in map if it exists or not
        if (updatedMap.has(refID[i])) {
          refAssets.push(updatedMap.get(refID[i]));
        } else {
          refAsset = await this.findEvents(apiQuery);
          if(refAsset[0]) {
          const refIDs = refAsset[0].refID.length > 0 ? refAsset[0].refID[0].map(ref => (ref.assetId ? ref.assetId : ref)) : [];
          const {refChildAssets, updatedMap1 } = await this.getBackwardReferenceAssets(refIDs, apiQuery, assetMapSet);
          updatedMap = updatedMap1;
          refAsset[0].asset.backwardReferenceAssets = refChildAssets;
          updatedMap.set(refID[i], refAsset[0].asset);
          refAssets.push(refAsset[0].asset);
          }
        }
      }
    }

    return { refChildAssets: refAssets, updatedMap1: updatedMap };
  }

  public async findEventRoutes(apiQuery: APIQuery, forward: boolean): Promise<any> {
    // Get the current UniqueIds assets and events data
    let results = await this.findEvents(apiQuery);
    if(results && results.length == 0) {
      return [];
    }

    let routes = [];
    let duplicateRoutes = {};

    // First get all routes of first asset obtained from unique Id
    const hasRefIds = results[0].refID[0] && results[0].refID[0].length > 0;
    let res = this.getAssetRoutes(results[0].asset, null, false, !hasRefIds);
    routes = routes.concat(res.routes);

    // Form the "from" data for next backward reference asset
    const from = routes.length > 0 ? (routes[0].from || routes[0].to) : null;

    // Form the "to" data for next forward reference asset
    let to = routes.length > 0 ? (routes[routes.length - 1].to || routes[routes.length - 1].from) : null;

    // Remove all the routes which have either "from" or "to" as null
    // They are not required since they have been already matched.
    // Check for duplicate routes and filter them
    let completeRoutes = [];
    if(routes.length > 0) {
      for(let i = 0; i < routes.length; i++) {
        if(routes[i].from && routes[i].to) {
          const uniqueRoute = routes[i].from.createdBy + "-" + routes[i].to.createdBy;
          if(!duplicateRoutes[uniqueRoute]) {
            completeRoutes.push(routes[i]);
            duplicateRoutes[uniqueRoute] = 1;
          }
        }
      }
    }
    routes = completeRoutes;

    // Get backward Inbound event objects until the asset creation address/farm
    const refIDs = results[0].refID.length > 0 ? results[0].refID[0].map(ref => (ref.assetId ? ref.assetId : ref)) : [];
    let tempRoutes = await this.getBackwardAssetRoutes(refIDs, apiQuery, from);

    // Remove all the routes which have either "from" or "to" as null
    // They are not required since they have been already matched.
    // Check for duplicate routes and filter them
    if(tempRoutes.length > 0) {
      for(let i = 0; i < tempRoutes.length; i++) {
        if(tempRoutes[i].from && tempRoutes[i].to) {
          const uniqueRoute = tempRoutes[i].from.createdBy + "-" + tempRoutes[i].to.createdBy;
          if(!duplicateRoutes[uniqueRoute]) {
            routes.push(tempRoutes[i]);
            duplicateRoutes[uniqueRoute] = 1;
          }
        }
      }
    }

    // Add forward routes if query param "forward" is passed with API
    if(forward) {
      // Add the "to" value for forward reference asset if it is null
      // This happens when we dont have an Inbound event in previous parent asset
      if(!to && routes.length > 0) {
        to = routes[routes.length - 1].to;
      }

      // Get forward Inbound event objects until the store/warehouse
      tempRoutes = await this.getForwardAssetRoutes(results[0].asset.content.idData.assetId, apiQuery, to);

      // Remove all the routes which have either "from" or "to" as null
      // They are not required since they have been already matched.
      // Check for duplicate routes and filter them
      if(tempRoutes.length > 0) {
        for(let i = 0; i < tempRoutes.length; i++) {
          if(tempRoutes[i].from && tempRoutes[i].to) {
            const uniqueRoute = tempRoutes[i].from.createdBy + "-" + tempRoutes[i].to.createdBy;
            if(!duplicateRoutes[uniqueRoute]) {
              routes.push(tempRoutes[i]);
              duplicateRoutes[uniqueRoute] = 1;
            }
          }
        }
      }
    }

    // Sort them based on creationTimestamp
    routes.sort((a, b) => a.createdDate - b.createdDate);

    return routes;
  }

  private async getForwardAssetRoutes(assetId, apiQuery: APIQuery, fromAddress) {
    let routes = [];

    if(assetId) {
      const query = {
        $or: [
          {
            'content.data.identifiers.referenceID': {
              $eq: assetId,
            }
          },
          {
            'content.data.identifiers.referenceID.assetId': {
              $eq: assetId,
            }
          }
        ]
      }
  
      apiQuery.query = query;
      let refAsset = await this.findEvents(apiQuery);
      if(refAsset && refAsset.length > 0) {
        for(let i = 0; i < refAsset.length; i++) {
          // Get all routes of current asset
          let tempRoutes = this.getAssetRoutes(refAsset[i].asset, fromAddress, true, false);

          routes = routes.concat(tempRoutes.routes);

          // Send the "from" value of the next reference asset based on the follwoing:
          // If routes have been returned from previous call, then pass the "to" or "from" value of last route
          // Else pass the "fromAddress" passed to the function call
          routes = routes.concat(await this.getForwardAssetRoutes(refAsset[i].asset.content.idData.assetId, 
            apiQuery, tempRoutes.routes.length > 0 ? 
            (tempRoutes.routes[tempRoutes.routes.length - 1].to || 
              tempRoutes.routes[tempRoutes.routes.length - 1].from) : fromAddress));
        }
      }
    }
    
    return routes;
  }

  private async getBackwardAssetRoutes(refID, apiQuery: APIQuery, toAddress) {
    let routes = [];

    if(refID && refID.length > 0) {
      for(let i = 0; i < refID.length; i++) {
        const query = {
          'content.idData.assetId': {
            $eq: refID[i]
          }
        }
  
        apiQuery.query = query;
        let refAsset = await this.findEvents(apiQuery);

        // Get all routes of current asset
        const hasRefIds = refAsset[0].refID[0] && refAsset[0].refID[0].length > 0;
        let tempRoutes = this.getAssetRoutes(refAsset[0].asset, toAddress, false, !hasRefIds);

        routes = routes.concat(tempRoutes.routes);

        // Send the "to" value of the next reference asset based on the follwoing:
        // If routes have been returned from previous call, then pass the "from" or "to" value of first route
        // Else pass the "toAddress" passed to the function call
        const refIDs = refAsset[0].refID.length > 0 ? refAsset[0].refID[0].map(ref => (ref.assetId ? ref.assetId : ref)) : [];
        routes = routes.concat(await this.getBackwardAssetRoutes(refIDs, 
          apiQuery, tempRoutes.routes.length > 0 ? 
          (tempRoutes.routes[0].from || tempRoutes.routes[0].to) : toAddress));
      }
    }

    return routes;
  }

  private getAssetRoutes(refAssets, address, forward: boolean, hasNoRefIds: boolean) {
    let routes = [];
    let creationRoute = null;
    const events = refAssets.events;

    if(events) {
      for(let event of events) {
        const data = event.content.data;
        if(data) {
          for(let d of data) {
            const direction = {
              address: d.streetAndNumber + ' ' + d.zipcodeAndCity,
              companyIdentifier: d.companyIdentifier,
              organizationName: d.organizationName,
              createdDate: d.creationTimestamp,
              createdBy: event.content.idData.createdBy
            }

            if(d.eventType && d.eventType === 'Inbound transport') {
              routes.push(direction);
            }
            else if(d.type === 'ambrosus.asset.info') {
              creationRoute = direction;
            }
          }
        }
      }
    }

    // We sort the evnets in ascending order
    routes.sort((a, b) => a.createdDate - b.createdDate);

    let finalRoutes = [];

    // When the current asset has no more references, we do the following
    if(hasNoRefIds) {
      if(address) {
        // Add a route with below combination if previous "address" value is valid
        // and the asset has atleast 1 Inbound event
        if(routes.length > 0) {
          finalRoutes.push({
            from: creationRoute,
            to: routes[0]
          });
        }
      }
      else {
        // Add a route with below combination if the previous "address" value is null
        finalRoutes.push({
          from: creationRoute,
          to: routes[0] || null
        });
      }
    }
    else {
      // If only 1 Inbound event is present in current asset, do the follwoing
      if(routes.length === 1) {
        // Add a route based on "address" value passed and if its forwardRef or backwardRef
        if(address) {
          if(forward) {
            finalRoutes.push({
              from: routes[0],
              to: null
            });
          }
          else {
            finalRoutes.push({
              from: null,
              to: routes[0]
            });
          }
        }
        else {
          finalRoutes.push({
            from: routes[0],
            to: null
          });
        }
      }
    }

    // Loop over all the Inbound routes if more than 1 and make the routes
    // as pairs from start of the array
    for(let i = 0; i < routes.length - 1; i++) {
      finalRoutes.push({
        from: routes[i],
        to: routes[i + 1]
      });
    }

    // If previous "address" value is valid, then add a new route
    if(address) {
      // Calculate "from" as follows:
      // 1. It is the "address" passed if this is a forwardRef asset
      // 2. Else It is creation route if the current asset has no backwardRefs and Inbound events
      // 3. Else It is the last route's "to" value from finalRoutes
      const from = forward ? address 
        : (hasNoRefIds && routes.length === 0 ? creationRoute 
          : finalRoutes.length > 0 ? finalRoutes[finalRoutes.length - 1].to : null);

      // Calculate "to" as follows:
      // 1. It is first route's "from" value if this is a forwardRef asset
      // 2. Else It is the "address" passed if this is a backwardRef asset
      const to = forward ? (finalRoutes.length > 0 ? finalRoutes[0].from : null) : address;
      
      if(from && to) {
        finalRoutes.push({
          from,
          to
        });
      }
    }

    // We remove the first route if it satifies the following conditions:
    // 1. The current asset has backwardReference assets
    // 2. The previous passed "address" is not null
    // 3. The "from" & "to" values of the route must not be null
    if(finalRoutes.length > 0 && !hasNoRefIds && address && (!finalRoutes[0].from || !finalRoutes[0].to)) {
      finalRoutes.shift();
    }

    return { routes: finalRoutes };
  }

  public async findAssetInboundTrace(apiQuery: APIQuery) : Promise<any> {
    // Query All Inbound Assets including System Generated Inbound Assets not created by current user
    const createdBy = apiQuery.query['content.idData.createdBy']['$eq'];
    let query = {
      $and: [ { 'content.idData.createdBy': { $ne: createdBy } }, { 'content.data.eventType': { $eq: 'Inbound transport' } } ]
    }

    apiQuery.query = query;
    const totalInboundAssets = await this.findEvents(apiQuery);
    let totalInboundCount = 0;
    if(totalInboundAssets) {
      totalInboundCount = totalInboundAssets.length;
    }

    // Query All System Generated Inbound Assets not created by current user
    query = {
      $and: [ 
        {  'content.idData.createdBy': { $ne: createdBy } },
        {  'content.data.eventType': { $eq: 'Inbound transport' } },
        {  'content.data.eventType': { $eq: 'system generated' } }
      ]
    }

    apiQuery.query = query;
    const inboundSystemGeneartedAssets = await this.findEvents(apiQuery);
    let inboundSystemGeneartedCount = 0;
    if(inboundSystemGeneartedAssets) {
      inboundSystemGeneartedCount = inboundSystemGeneartedAssets.length;
    }

    // Subtract to get Inbound Assets which are not system generated
    const inboundCount = totalInboundCount - inboundSystemGeneartedCount;

    // Return the trace
    return { 'inboundTrace': totalInboundCount > 0 ? (inboundCount/totalInboundCount) * 100 : 0 };
  }

  public async findAssetOutboundTrace(apiQuery: APIQuery) : Promise<any> {
    // Query total Assets created by current user
    const totalAssets = await this.count(apiQuery);

    // Query Outbound Assets created by current user
    const createdBy = apiQuery.query['content.idData.createdBy']['$eq'];
    const query = {
      $and: [ { 'content.idData.createdBy': { $eq: createdBy } }, { 'content.data.eventType': { $eq: 'Outbound transport' } } ]
    }

    apiQuery.query = query;
    const outboundAssets = await this.findEvents(apiQuery);
    let outboundCount = 0;
    if(outboundAssets) {
      outboundCount = outboundAssets.length;
    }

    // Return the trace
    return { 'outboundTrace': totalAssets > 0 ? (outboundCount/totalAssets) * 100 : 0 };
  }

  public async findAssetTotalTrace(apiQuery: APIQuery) : Promise<any> {
    const inboundTrace = await this.findAssetInboundTrace(new APIQuery(apiQuery.query));
    const outboundTrace = await this.findAssetOutboundTrace(new APIQuery(apiQuery.query));

    return { 
      'inboundTrace': inboundTrace['inboundTrace'],
      'outboundTrace': outboundTrace['outboundTrace'],
      'totalTrace' : ( inboundTrace['inboundTrace'] + outboundTrace['outboundTrace'] ) / 2 
    };
  }

  public async findAssetInboundTraceAll(apiQuery: APIQuery, childPublicKeys: string[]) : Promise<any> {
    // Query All Inbound Assets including System Generated Inbound Assets not created by current user and child users
    let publicKeys = [];
    if(apiQuery.query['content.idData.createdBy']) {
      publicKeys.push(apiQuery.query['content.idData.createdBy']['$eq']);
      publicKeys = publicKeys.concat(childPublicKeys && childPublicKeys.length > 0 ? childPublicKeys : []);
    }

    let query = {
      $and: [ { 'content.idData.createdBy': { $nin: publicKeys } }, { 'content.data.eventType': { $eq: 'Inbound transport' } } ]
    }

    apiQuery.query = query;
    const totalInboundAssets = await this.findEvents(apiQuery);
    let totalInboundCount = 0;
    if(totalInboundAssets) {
      totalInboundCount = totalInboundAssets.length;
    }

    // Query All System Generated Inbound Assets not created by current user
    query = {
      $and: [ 
        {  'content.idData.createdBy': { $nin: publicKeys } },
        {  'content.data.eventType': { $eq: 'Inbound transport' } },
        {  'content.data.eventType': { $eq: 'system generated' } }
      ]
    }

    apiQuery.query = query;
    const inboundSystemGeneartedAssets = await this.findEvents(apiQuery);
    let inboundSystemGeneartedCount = 0;
    if(inboundSystemGeneartedAssets) {
      inboundSystemGeneartedCount = inboundSystemGeneartedAssets.length;
    }

    // Subtract to get Inbound Assets which are not system generated
    const inboundCount = totalInboundCount - inboundSystemGeneartedCount;

    // Return the trace
    return { 'inboundTrace': totalInboundCount > 0 ? (inboundCount/totalInboundCount) * 100 : 0 };
  }

  public async findAssetOutboundTraceAll(apiQuery: APIQuery, childPublicKeys: string[]) : Promise<any> {
    // Query total Assets created by current user
    const totalAssets = await this.count(apiQuery);

    let publicKeys = [];
    if(apiQuery.query['content.idData.createdBy']) {
      publicKeys.push(apiQuery.query['content.idData.createdBy']['$eq']);
      publicKeys = publicKeys.concat(childPublicKeys && childPublicKeys.length > 0 ? childPublicKeys : []);
    }

    // Query Outbound Assets created by current user
    const query = {
      $and: [ { 'content.idData.createdBy': { $in: publicKeys } }, { 'content.data.eventType': { $eq: 'Outbound transport' } } ]
    }

    apiQuery.query = query;
    const outboundAssets = await this.findEvents(apiQuery);
    let outboundCount = 0;
    if(outboundAssets) {
      outboundCount = outboundAssets.length;
    }

    // Return the trace
    return { 'outboundTrace': totalAssets > 0 ? (outboundCount/totalAssets) * 100 : 0 };
  }

  public async findAssetTotalTraceAll(apiQuery: APIQuery, childPublicKeys: string[]) : Promise<any> {
    const inboundTrace = await this.findAssetInboundTraceAll(new APIQuery(apiQuery.query), childPublicKeys);
    const outboundTrace = await this.findAssetOutboundTraceAll(new APIQuery(apiQuery.query), childPublicKeys);

    return { 
      'inboundTrace': inboundTrace['inboundTrace'],
      'outboundTrace': outboundTrace['outboundTrace'],
      'totalTrace' : ( inboundTrace['inboundTrace'] + outboundTrace['outboundTrace'] ) / 2 
    };
  }

  public assetEventsOfType(
    assets: string[],
    type: string,
    apiQuery: APIQuery
  ): Promise<MongoPagedResult> {
    apiQuery.query = [
      {
        $match: {
          'content.data.type': type,
          'content.idData.assetId': {
            $in: assets,
          },
        },
      },
      {
        $group: {
          _id: '$content.idData.assetId',
          doc: {
            $first: '$$ROOT',
          },
        },
      },
      {
        $project: {
          _id: 0.0,
          eventId: '$doc.eventId',
          content: '$doc.content',
          metadata: '$doc.metadata',
        },
      },
    ];
    apiQuery.fields = {
      repository: 0,
    };
    return super.aggregate(apiQuery);
  }

  public async queryEventsOld(apiQuery: APIQuery, accessLevel: number) {
    apiQuery.query = {
      ...apiQuery.query,
      ...{
        'content.idData.accessLevel': { $lte: accessLevel },
      },
    };
    apiQuery.fields = {
      _id: 0,
      repository: 0,
    };

    const results = await this.find(apiQuery);

    return { results, resultCount: results.length };
  }

  public async getAssetIdFromPartner(query) {    
    let pipeline: any = [
      {
        $match: query
      }
    ];
    pipeline = pipeline.concat({
      $project: {
        _id: 0,
        assetId: '$content.idData.assetId',
      }
    })
    const apQuery = new APIQuery();
    apQuery.query = pipeline;
    const results = await super.aggregate(apQuery);
    return results.map(ele => ele.assetId);
  }
}
