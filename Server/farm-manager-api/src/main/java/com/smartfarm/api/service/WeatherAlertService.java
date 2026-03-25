package com.smartfarm.api.service;

import com.smartfarm.api.dto.WeatherAlertDto;
import com.smartfarm.api.entity.WeatherAlert;
import com.smartfarm.api.mapper.WeatherAlertMapper;
import com.smartfarm.api.repository.WeatherAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class WeatherAlertService {

    private final WeatherAlertRepository weatherAlertRepository;
    private final WeatherAlertMapper weatherAlertMapper;

    @Autowired
    public WeatherAlertService(WeatherAlertRepository weatherAlertRepository, WeatherAlertMapper weatherAlertMapper) {
        this.weatherAlertRepository = weatherAlertRepository;
        this.weatherAlertMapper = weatherAlertMapper;
    }

    public List<WeatherAlertDto> findAll() {
        return weatherAlertRepository.findAll().stream().map(weatherAlertMapper::toDto).collect(Collectors.toList());
    }

    public List<WeatherAlertDto> findByBatchId(Integer pBatchId) {
        return weatherAlertRepository.findByPlantingBatchPBatchId(pBatchId).stream().map(weatherAlertMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<WeatherAlertDto> findById(Integer id) {
        return weatherAlertRepository.findById(id).map(weatherAlertMapper::toDto);
    }

    public WeatherAlertDto create(WeatherAlertDto dto) {
        WeatherAlert entity = weatherAlertMapper.toEntity(dto);
        return weatherAlertMapper.toDto(weatherAlertRepository.save(entity));
    }

    public Optional<WeatherAlertDto> update(Integer id, WeatherAlertDto dto) {
        if (!weatherAlertRepository.existsById(id))
            return Optional.empty();
        WeatherAlert entity = weatherAlertMapper.toEntity(dto);
        entity.setAlertId(id);
        return Optional.of(weatherAlertMapper.toDto(weatherAlertRepository.save(entity)));
    }

    public boolean deleteById(Integer id) {
        if (!weatherAlertRepository.existsById(id))
            return false;
        weatherAlertRepository.deleteById(id);
        return true;
    }
}
