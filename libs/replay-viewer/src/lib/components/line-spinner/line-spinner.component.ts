import { Component, HostBinding, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'nx-bridge-line-spinner',
  templateUrl: './line-spinner.component.html',
  styleUrls: ['./line-spinner.component.scss']
})
export class LineSpinnerComponent implements OnInit {
  @HostBinding ('class.hidden') get getAreDealsLoaded() {
    const areDealsLoaded = this.searchService.getAreDealsLoaded();
    const isLoading = this.searchService.getIsLoading();
    return areDealsLoaded || !isLoading;
  }

  constructor(
    private searchService: SearchService,
  ) { }

  ngOnInit(): void {
  }

}
