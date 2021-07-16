import { Pipe, PipeTransform } from '@angular/core';
import { filterManagerBids, filterManagerContracts, getContractAsHtmlEntityString } from '@nx-bridge/constants';

@Pipe({
  name: 'getContractAsHtmlEntityString'
})
export class GetContractAsHtmlEntityStringPipe implements PipeTransform {
  transform(contract: string): string {
    if (!contract) return 'No contract in getContractAsHtmlEntityString'
    if (contract === filterManagerContracts[0]) return contract;
    if (contract === filterManagerBids[0]) return contract;
    return getContractAsHtmlEntityString(contract);
  }

}


